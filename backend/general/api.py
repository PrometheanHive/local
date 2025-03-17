import os
from typing import List
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.conf import settings
from ninja import Router, Schema, File
from ninja.files import UploadedFile
from pydantic import constr
from .models import Event, Booking

router = Router()
UserModel = auth.get_user_model()

UPLOAD_DIR = "/var/www/uploads/"  # Adjust as needed

### Custom JSON Response Handler
def json_response(data, status=200):
    response = JsonResponse(data, status=status, safe=isinstance(data, dict))
    response["Access-Control-Allow-Credentials"] = "true"
    return response


### Define API Schemas with Validation
class UserCreateSchema(Schema):
    username: constr(min_length=3, max_length=150)  # Ensure valid username
    password: constr(min_length=6)  # Minimum password length for security


class UserAuthSchema(Schema):
    username: str
    password: str


class EventSchema(Schema):
    id: int
    title: str
    description: str
    unique_aspect: str
    occurence_date: str
    location: str
    price: float


class BookingSchema(Schema):
    id: int
    event_id: int
    event_title: str
    event_date: str


### File Upload API
@router.post("/upload")
def upload_file(request, file: UploadedFile = File(...)):
    """Handles file uploads and stores them on the EC2 attached volume."""
    
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)  # Ensure directory exists

    file_path = os.path.join(UPLOAD_DIR, file.name)

    # Save file to local storage
    with open(file_path, "wb") as f:
        f.write(file.read())  # Use `.read()` instead of `.chunks()` for efficiency

    # Return the accessible file path
    return json_response({"fileUrl": f"/media/{file.name}"})  # URL for frontend access


### Health Check API
@router.get("/health")
def health_check(request):
    """Simple health check endpoint for AWS ALB and monitoring tools."""
    return json_response({"status": "ok"})


### Authentication Endpoints
@router.get("/user")
def get_user(request):
    """Ensure frontend doesn't crash by returning `user: null` when unauthorized."""
    if request.user.is_authenticated:
        return json_response({"username": request.user.username, "email": request.user.email})
    else:
        return json_response({"user": None}, status=200)  # Fix: Return `{ user: null }` instead of `401`


@router.post("/user/create")
def create_user(request, payload: UserCreateSchema):
    """Creates a new user account."""
    if UserModel.objects.filter(username=payload.username).exists():
        return json_response({"error": "Username already exists"}, status=400)
    
    user = UserModel.objects.create_user(username=payload.username, password=payload.password)  # Ensures password is hashed
    return json_response({"message": "User created successfully", "user_id": user.id})


@router.post("/user/authenticate")
def authenticate_user(request, payload: UserAuthSchema):
    """User authentication and session management."""
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        login(request, user)

        if not request.session.session_key:
            request.session.create()  # Ensure session key exists

        response = json_response({
            "message": "User authenticated successfully",
            "user_id": user.id
        })
        response.set_cookie(
            "sessionid", request.session.session_key,
            httponly=True, secure=True, samesite="None"
        )
        return response
    else:
        return json_response({"error": "Invalid username or password"}, status=401)


@router.post("/user/logout")
def logout_user(request):
    """Logs the user out and clears session cookie."""
    logout(request)
    response = json_response({"message": "User logged out successfully"})
    response.delete_cookie("sessionid", path="/", samesite="Lax")
    return response


### Events & Bookings APIs
@router.get("/user/bookings", response=List[BookingSchema])
def get_user_bookings(request):
    """Retrieve user bookings."""
    if not request.user.is_authenticated:
        return json_response({"error": "Not authenticated"}, status=401)

    bookings = Booking.objects.filter(guest=request.user).select_related('event')

    if not bookings.exists():
        return json_response([])  # Return empty list if no bookings

    return [
        BookingSchema(
            id=booking.id,
            event_id=booking.event.id,
            event_title=booking.event.title,
            event_date=str(booking.event.occurence_date)
        ) for booking in bookings
    ]


@router.get("/event/get_all", response=List[EventSchema])
def list_all_events(request):
    """Returns a list of all events."""
    events = Event.objects.all()

    if not events.exists():
        return json_response([])  # Return empty list if no events

    return [
        EventSchema(
            id=event.id,
            title=event.title,
            description=event.description,
            unique_aspect=event.unique_aspect,
            occurence_date=str(event.occurence_date),
            location=event.location or "",
            price=float(event.price)
        ) for event in events
    ]
