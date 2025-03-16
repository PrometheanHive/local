from ninja import Router, Schema, File,  ModelSchema
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from typing import List
from django.shortcuts import get_object_or_404
from . import models
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from ninja.files import UploadedFile

router = Router()
UserModel = auth.get_user_model()

UPLOAD_DIR = "/var/www/uploads/"  # Change this to your preferred EC2 storage path

###  FIX: Ensure all API responses explicitly allow credentials ###
from django.http import JsonResponse

def json_response(data, status=200):
    """Custom JSON response handler that supports lists and CORS credentials."""
    response = JsonResponse(data, status=status, safe=isinstance(data, dict))  # Set `safe=False` for lists
    response["Access-Control-Allow-Credentials"] = "true"  # Preserve CORS credentials
    return response


# ============================
# 🔹 AUTHENTICATION ENDPOINTS
# ============================



@router.post("/upload")
def upload_file(request, file: UploadedFile = File(...)):
    """Handles file uploads and stores them on the EC2 attached volume."""
    
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)  # Ensure directory exists

    file_path = os.path.join(UPLOAD_DIR, file.name)

    # Save file to local storage
    with open(file_path, "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)

    # Return the accessible file path
    return JsonResponse({"fileUrl": f"/media/{file.name}"})  # URL for frontend access

@router.get("/health")
def health_check(request):
    """Simple health check endpoint for AWS ALB and monitoring tools."""
    return json_response({"status": "ok"})

@router.get("/user")
def get_user(request):
    """ FIX: Ensure frontend doesn't crash by returning `user: null` when unauthorized """
    if request.user.is_authenticated:
        return json_response({"username": request.user.username, "email": request.user.email})
    else:
        return json_response({"user": None}, status=200)  # Fix: Return `{ user: null }` instead of `401`


@router.post("/user/authenticate")
def authenticate_user(request, payload: Schema):
    """ FIX: Properly log in user & send `sessionid` cookie for authentication """
    user = authenticate(username=payload.username, password=payload.password)
    
    if user is not None:
        login(request, user)
        
        response = json_response({
            "message": "User authenticated successfully",
            "user_id": user.id
        })

        # Fix: Ensure sessionid is included in response
        response.set_cookie(
            "sessionid", request.session.session_key,
            httponly=True, secure=True, samesite="None"
        )
        
        return response
    else:
        return json_response({"error": "Invalid username or password"}, status=401)


@router.post("/user/logout")
def logout_user(request):
    """ FIX: Properly clear session & remove session cookie on logout """
    logout(request)
    response = json_response({"message": "User logged out successfully"})
    
    # Ensure session cookie is properly deleted
    response.delete_cookie("sessionid", path="/", samesite="Lax")

    return response

@router.post("/user/create")
def create_user(request, payload: Schema):
    """Creates a new user account."""
    if UserModel.objects.filter(username=payload.username).exists():
        return json_response({"error": "Username already exists"}, status=400)
    
    user = UserModel.objects.create_user(username=payload.username, password=payload.password)
    return json_response({"message": "User created successfully", "user_id": user.id})

# ============================
# 🔹 EVENTS & BOOKINGS
# ============================

@router.get("/event/get_all", response=List[dict])
def list_all_events(request):
    """ Ensure API always returns an array & handles NoneType safely."""
    events = models.Event.objects.all().select_related('host')

    event_data = []
    for event in events:
        event_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'unique_aspect': event.unique_aspect,
            'number_of_guests': event.number_of_guests,
            'number_of_bookings': event.number_of_bookings,
            'occurence_date': event.occurence_date,
            'location': event.location,
            'price': event.price,
            'host_username': event.host.username if event.host else "Unknown",
            'host_first_name': event.host.first_name if event.host else "Unknown",
            'photos': event.photos if event.photos else [],
        })

    return json_response(event_data)  # Ensures `safe=False` for lists



@router.get("/user/bookings")
def get_user_bookings(request):
    """ FIX: Ensure proper authentication & return empty array if unauthorized """
    if request.user.is_authenticated:
        bookings = models.Booking.objects.filter(guest=request.user).select_related('event')
        booking_data = [
            {
                'id': booking.id,
                'event_id': booking.event.id,
                'event_title': booking.event.title,
                'event_date': booking.event.occurence_date
            } for booking in bookings
        ]
        return json_response(booking_data)
    else:
        return json_response({"error": "Not authenticated"}, status=401)

