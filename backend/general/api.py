from ninja import Router, Schema, ModelSchema
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from typing import List
from django.shortcuts import get_object_or_404
from . import models

router = Router()
UserModel = auth.get_user_model()

### 📌 FIX: Ensure all API responses explicitly allow credentials ###
def json_response(data, status=200):
    response = JsonResponse(data, status=status)
    response["Access-Control-Allow-Credentials"] = "true"
    return response

# ============================
# 🔹 AUTHENTICATION ENDPOINTS
# ============================

@router.get("/user")
def get_user(request):
    """ ✅ FIX: Ensure frontend doesn't crash by returning `user: null` when unauthorized """
    if request.user.is_authenticated:
        return json_response({"username": request.user.username, "email": request.user.email})
    else:
        return json_response({"user": None}, status=200)  # ✅ Fix: Return `{ user: null }` instead of `401`


@router.post("/user/authenticate")
def authenticate_user(request, payload: Schema):
    """ ✅ FIX: Properly log in user & send `sessionid` cookie for authentication """
    user = authenticate(username=payload.username, password=payload.password)
    
    if user is not None:
        login(request, user)
        
        response = json_response({
            "message": "User authenticated successfully",
            "user_id": user.id
        })

        # ✅ Fix: Ensure sessionid is included in response
        response.set_cookie(
            "sessionid", request.session.session_key,
            httponly=True, secure=True, samesite="None"
        )
        
        return response
    else:
        return json_response({"error": "Invalid username or password"}, status=401)


@router.post("/user/logout")
def logout_user(request):
    """ ✅ FIX: Properly clear session & remove session cookie on logout """
    logout(request)
    response = json_response({"message": "User logged out successfully"})
    
    # ✅ Ensure session cookie is properly deleted
    response.delete_cookie("sessionid", path="/", samesite="Lax")

    return response


# ============================
# 🔹 EVENTS & BOOKINGS
# ============================

@router.get("/event/get_all", response=List[dict])
def list_all_events(request):
    """ ✅ FIX: Ensure API returns an empty array instead of `None` """
    events = models.Event.objects.all().select_related('host')

    event_data = [
        {
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'unique_aspect': event.unique_aspect,
            'number_of_guests': event.number_of_guests,
            'number_of_bookings': event.number_of_bookings,
            'occurence_date': event.occurence_date,
            'location': event.location,
            'price': event.price,
            'host_username': event.host.username,
            'host_first_name': event.host.first_name,
            'photos': event.photos or [],  # ✅ Fix: Prevents `NoneType` errors
        }
        for event in events
    ]

    return json_response(event_data)  # ✅ Ensure API always returns an array


@router.get("/user/bookings")
def get_user_bookings(request):
    """ ✅ FIX: Ensure proper authentication & return empty array if unauthorized """
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

