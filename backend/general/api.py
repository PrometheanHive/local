import os
from typing import List, Optional
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from django.conf import settings
from ninja import Router, Schema, File
from ninja.files import UploadedFile
from pydantic import constr
from .models import Event, Booking
from ninja.errors import HttpError
from datetime import datetime
from . import models


router = Router()
UserModel = auth.get_user_model()

UPLOAD_DIR = settings.MEDIA_ROOT  # instead of "/var/www/uploads/"
  # Adjust as needed

### Custom JSON Response Handler
def json_response(data, status=200):
    response = JsonResponse(data, status=status, safe=isinstance(data, dict))
    response["Access-Control-Allow-Credentials"] = "true"
    return response


class UserCreateSchema(Schema):
    username: constr(min_length=3, max_length=150)
    password: constr(min_length=6)
    first_name: str
    last_name: str
    email: str


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
    photos: List[str] = []
    number_of_guests: int
    number_of_bookings: int


class BookingSchema(Schema):
    id: int
    event_id: int
    event_title: str
    event_date: str


class EventCreateSchema(Schema):
    title: str
    description: str
    unique_aspect: str
    occurence_date: str  # Expecting ISO string
    location: str
    price: float
    number_of_guests: int
    number_of_bookings: int
    photos: List[str] = []

class EventCreateResponse(Schema):
    message: str
    event_id: int

class ReviewSchema(Schema):
    text: str
    rating: int

class ReviewCreateSchema(Schema):
    event_id: int
    text: str
    rating: int

class PhotoUpdateSchema(Schema):
    photos: List[str]


### File Upload API
@router.post("/upload")
def upload_file(request, file: UploadedFile = File(...), event_id: int = 0):
    """Handles file uploads and stores them in a per-event subdirectory."""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    # Use event_id to create subdirectory
    event_folder = os.path.join(UPLOAD_DIR, str(event_id))
    os.makedirs(event_folder, exist_ok=True)

    file_path = os.path.join(event_folder, file.name)

    with open(file_path, "wb") as f:
        f.write(file.read())

    return json_response({"fileUrl": f"/media/{event_id}/{file.name}"})

@router.patch("/event/id/{event_id}/update_photos")
def update_event_photos(request, event_id: int, payload: PhotoUpdateSchema):
    try:
        event = Event.objects.get(id=event_id)
        event.photos = payload.photos
        event.save()
        return json_response({"message": "Photos updated successfully"})
    except Event.DoesNotExist:
        raise HttpError(404, "Event not found")


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
    if UserModel.objects.filter(username=payload.username).exists():
        return json_response({"error": "Username already exists"}, status=400)

    user = UserModel.objects.create_user(
        username=payload.username,
        password=payload.password,
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name
    )
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
        price=float(event.price),
        photos=event.photos or [],
        number_of_guests=event.number_of_guests,
        number_of_bookings=event.number_of_bookings
    ) for event in events
]


@router.post("/event/create", response=EventCreateResponse)
def create_event(request, payload: EventCreateSchema):
    if not request.user.is_authenticated:
        raise HttpError(401, "Authentication required")

    try:
        event = Event.objects.create(
            title=payload.title,
            description=payload.description,
            unique_aspect=payload.unique_aspect,
            occurence_date=datetime.fromisoformat(payload.occurence_date),
            location=payload.location,
            price=payload.price,
            number_of_guests=payload.number_of_guests,
            number_of_bookings=payload.number_of_bookings,
            photos=payload.photos,
            host=request.user
        )
    except Exception as e:
        raise HttpError(400, f"Failed to create event: {str(e)}")

    return {"message": "Event created", "event_id": event.id}

@router.get("/event/id/{event_id}")
def get_event_by_id(request, event_id: int):
    try:
        event = Event.objects.get(id=event_id)
        return json_response({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "unique_aspect": event.unique_aspect,
            "occurence_date": str(event.occurence_date),
            "location": event.location or "",
            "price": float(event.price),
            "photos": event.photos or [],
            "host_first_name": event.host.first_name if event.host else "Unknown"
        })
    except Event.DoesNotExist:
        raise HttpError(404, "Event not found")


#  #Reviews 
from .models import Review

@router.get("/event/{event_id}/reviews", response=List[ReviewSchema])
def list_reviews_for_event(request, event_id: int):
    try:
        event = models.Event.objects.get(id=event_id)
    except models.Event.DoesNotExist:
        raise HttpError(404, "Event not found")

    return [
        ReviewSchema(text=review.text, rating=review.rating)
        for review in event.reviews.all()
    ]


@router.post("/booking/register/{event_id}")
def register_booking(request, event_id: int):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        event = models.Event.objects.get(id=event_id)
    except models.Event.DoesNotExist:
        raise HttpError(404, "Event not found")

    guest = request.user
    booking, created = models.Booking.objects.get_or_create(event=event, guest=guest)

    if created:
        event.number_of_bookings += 1
        event.save()
        return {"id": booking.id, "message": "Booking created successfully"}

    return {"id": booking.id, "message": "Booking already exists"}



@router.get("/user/bookings", response=List[BookingSchema])
def get_user_bookings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    bookings = models.Booking.objects.filter(guest=request.user).select_related('event')

    return [
        BookingSchema(
            id=booking.id,
            event_id=booking.event.id,
            event_title=booking.event.title,
            event_date=str(booking.event.occurence_date)
        )
        for booking in bookings
    ]

@router.post("/reviews/create")
def create_review(request, payload: ReviewCreateSchema):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    try:
        event = models.Event.objects.get(id=payload.event_id)
    except models.Event.DoesNotExist:
        raise HttpError(404, "Event not found")

    if not (1 <= payload.rating <= 5):
        raise HttpError(400, "Rating must be between 1 and 5")

    review = models.Review.objects.create(
        event=event,
        text=payload.text,
        rating=payload.rating
    )

    return json_response({
        "message": "Review created successfully",
        "review_id": review.id
    })