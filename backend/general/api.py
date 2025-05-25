import os
from typing import List, Optional
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from django.conf import settings
from ninja import Router, Schema, File, Form
from ninja.files import UploadedFile
from pydantic import constr
from .models import Event, Booking, AllowedDM
from ninja.errors import HttpError
from datetime import datetime
from . import models
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.db.models import Q, F
from .models import EventTags
from datetime import datetime
from django.utils import timezone
from geopy.distance import geodesic
import pytz 
from typing import Literal
import requests
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

class OAuthSchema(Schema):
    provider: Literal["google", "apple", "meta"]
    token: str

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
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: float
    photos: List[str] = []
    number_of_guests: int
    number_of_bookings: int
    tags: List[str] = []


class BookingSchema(Schema):
    id: int
    event_id: int
    event_title: str
    event_date: str


class EventCreateSchema(Schema):
    title: str
    description: str
    unique_aspect: str
    occurence_date: str  # ISO string
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: float
    number_of_guests: int
    number_of_bookings: int
    photos: List[str] = []
    tags: List[int] = []

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

class StartDMSchema(Schema):
    target_user_id: int

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
def get_current_user(request):
    if request.user.is_authenticated:
        return {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "bio": request.user.bio,
            "profile_pic": request.user.profile_pic.url if request.user.profile_pic else None,
            "is_traveler": request.user.is_traveler,
            "is_host": request.user.is_host
        }
    else:
        return json_response({"Unauthorized": "Not Logged in"}, status=401)
        #raise HttpError(401, "Not logged in")


@router.post("/user/create")
def create_user(request):
    data = request.POST
    email = data.get("email")
    username = email  # Enforce email=username

    # Check for email collision
    existing_user = UserModel.objects.filter(email=email).first()
    if existing_user:
        if existing_user.auth_provider and existing_user.auth_provider != "local":
            return json_response({
                "error": (
                    f"This email is already associated with a {existing_user.auth_provider.capitalize()} login. "
                    f"Please log in using {existing_user.auth_provider.capitalize()}."
                )
            }, status=409)
        else:
            return json_response({"error": "An account with this email already exists."}, status=409)

    user = UserModel.objects.create_user(
        username=username,
        password=data.get("password"),
        email=email,
        first_name=data.get("first_name"),
        last_name=data.get("last_name")
    )
    user.bio = data.get("bio", "")
    user.is_traveler = data.get("role") in ["traveler", "both"]
    user.is_host = data.get("role") in ["host", "both"]
    user.auth_provider = "local"
    user.save()

    # ✅ Automatically allow messaging to admin/owner account
    try:
        owner_user = UserModel.objects.get(email="experiencebylocals@gmail.com")
        user1, user2 = sorted([user, owner_user], key=lambda u: u.id)
        AllowedDM.objects.get_or_create(user1=user1, user2=user2)
        print(f"✅ DM access granted between {user1.username} and {user2.username}")
    except UserModel.DoesNotExist:
        print("⚠️ Owner user not found — skipping auto-DM setup")

    send_mail(
        subject="Welcome to Local!",
        message=(
            f"Hi {user.first_name},\n\n"
            "Welcome to Local — we're excited to help you experience real culture wherever you travel.\n\n"
            "You can log in anytime at https:/experiencebylocals.com/sign-in\n\n"
            "Have questions or ideas? Just email us anytime at support@experiencebylocals.com.\n\n"
            "Cheers,\nThe Local Team"
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False
    )

    return json_response({"message": "User created", "user_id": user.id})



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

@router.get("/user/exists-by-email")
def check_user_exists_by_email(request, email: str):
    exists = get_user_model().objects.filter(email=email).exists()
    return {"exists": exists}

@router.post("/user/oauth-login")
def oauth_login(request, payload: OAuthSchema):
    try:
        if payload.provider == "google":
            idinfo = google_id_token.verify_oauth2_token(
                payload.token,
                google_requests.Request(),
                audience=None
            )
            email = idinfo["email"]
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")
        else:
            raise HttpError(400, "Unsupported provider")

        user = UserModel.objects.filter(email=email).first()

        if user:
            # Conflict with another provider
            if user.auth_provider and user.auth_provider != payload.provider:
                raise HttpError(409, f"This email is already used for {user.auth_provider.capitalize()} login. Please log in using that method.")
            # Allow login for matching provider
            print(f"✅ Logging in existing user {email}")
        else:
            # Create new user
            user = UserModel.objects.create_user(
                username=email,
                email=email,
                password=None
            )
            user.first_name = first_name
            user.last_name = last_name
            user.is_traveler = True
            user.auth_provider = payload.provider
            user.save()
            print(f"✅ Created new user via {payload.provider}: {email}")

            # ✅ Automatically allow messaging to admin/owner account
            try:
                owner_user = UserModel.objects.get(email="experiencebylocals@gmail.com")
                user1, user2 = sorted([user, owner_user], key=lambda u: u.id)
                AllowedDM.objects.get_or_create(user1=user1, user2=user2)
                print(f"✅ DM access granted between {user1.username} and {user2.username}")
            except UserModel.DoesNotExist:
                print("⚠️ Owner user not found — skipping auto-DM setup")

            # ✅ Send welcome email
            send_mail(
                subject="Welcome to Local!",
                message=(
                    f"Hi {user.first_name},\n\n"
                    "Welcome to Local — we're excited to help you experience real culture wherever you travel.\n\n"
                    "You can log in anytime at https:/experiencebylocals.com/sign-in\n\n"
                    "Have questions or ideas? Just email us anytime at support@experiencebylocals.com.\n\n"
                    "Cheers,\nThe Local Team"
                ),
                from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
                recipient_list=[user.email],
                fail_silently=False
            )


        login(request, user)
        request.session.create()

        response = json_response({
            "message": "User logged in via OAuth",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": user.bio,
                "profile_pic": user.profile_pic.url if user.profile_pic else None,
                "is_traveler": user.is_traveler,
                "is_host": user.is_host
            }
        })
        response.set_cookie(
            "sessionid", request.session.session_key,
            httponly=True, secure=True, samesite="None"
        )
        return response

    except ValueError as ve:
        print("❌ Google token verification failed:", ve)
        raise HttpError(401, "Invalid Google token")
    except Exception as e:
        import traceback
        print("🔥 OAuth login error:", traceback.format_exc())
        raise HttpError(500, "OAuth login failed")


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

@router.get("/user/hosted_events")
def get_user_events(request):
    return list(Event.objects.filter(host=request.user).values())


from django.http import QueryDict

@router.post("/user/update")
def update_user_profile(request):
    if not request.user.is_authenticated:
        raise HttpError(401, "Unauthorized")

    post = request.POST
    files = request.FILES

    first_name = post.get("first_name")
    last_name = post.get("last_name")
    bio = post.get("bio")
    profile_pic = files.get("profile_pic")

    user = request.user
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if bio:
        user.bio = bio
    if profile_pic:
        user.profile_pic.save(profile_pic.name, profile_pic.file, save=True)

    user.save()
    return json_response({"message": "Profile updated successfully"})




@router.get("/event/get_all", response=List[EventSchema])
def list_filtered_events(request, 
                         date: Optional[str] = None,
                         date_after: Optional[str] = None,
                         date_before: Optional[str] = None,
                         location: Optional[str] = None,
                         radius: Optional[int] = None,
                         tags_include: Optional[str] = None,
                         tags_exclude: Optional[str] = None,
                         available_only: Optional[bool] = False,
                         sort_by_date: Optional[bool] = True,
                         user_lat: Optional[float] = None,
                         user_lon: Optional[float] = None,
                         show_old: Optional[bool] = True):

    qs = Event.objects.all()

    now = timezone.now()
    if not show_old:
        qs = qs.filter(occurence_date__gte=now)

    if date:
        from datetime import timedelta
        from django.utils.timezone import make_aware

        try:
            parsed = datetime.strptime(date, "%Y-%m-%d")
            mst = pytz.timezone("America/Denver")
            start = mst.localize(parsed)
            end = start + timedelta(days=1)
            qs = qs.filter(occurence_date__gte=start, occurence_date__lt=end)
        except ValueError:
            pass

    if date_after:
        qs = qs.filter(occurence_date__gte=date_after)

    if date_before:
        qs = qs.filter(occurence_date__lte=date_before)

    if available_only:
        qs = qs.filter(number_of_bookings__lt=F("number_of_guests"))

    if tags_include:
        include_tags = tags_include.split(",")
        qs = qs.filter(tags__tag_name__in=include_tags).distinct()

    if tags_exclude:
        exclude_tags = tags_exclude.split(",")
        qs = qs.exclude(tags__tag_name__in=exclude_tags)

    if user_lat is not None and user_lon is not None and radius is not None:
        user_coords = (user_lat, user_lon)
        filtered_ids = []
        for event in qs:
            if event.latitude is not None and event.longitude is not None:
                dist = geodesic(user_coords, (event.latitude, event.longitude)).miles
                if dist <= radius:
                    filtered_ids.append(event.id)
        qs = qs.filter(id__in=filtered_ids)

    if sort_by_date:
        qs = qs.order_by("occurence_date")

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
            number_of_bookings=event.number_of_bookings,
            tags=[tag.tag_name for tag in event.tags.all()]
        ) for event in qs
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
            latitude=payload.latitude,
            longitude=payload.longitude,
            price=payload.price,
            number_of_guests=payload.number_of_guests,
            number_of_bookings=payload.number_of_bookings,
            photos=payload.photos,
            host=request.user
        )
        if payload.tags:
                event.tags.set(EventTags.objects.filter(id__in=payload.tags))
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
            "host_first_name": event.host.first_name if event.host else "Unknown",
            "host_last_name": event.host.last_name if event.host else "",
            "host_profile_pic": event.host.profile_pic.url if event.host and event.host.profile_pic else "",
            "host_id": event.host.id if event.host else None,
            "tags": [tag.tag_name for tag in event.tags.all()]
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

@router.delete("/booking/delete/{booking_id}")
def delete_booking(request, booking_id: int):
    if not request.user or not request.user.is_authenticated:
        return HttpResponseForbidden("Authentication required")

    booking = get_object_or_404(Booking, id=booking_id)
    event = booking.event
    booking.delete()
    event.number_of_bookings = Booking.objects.filter(event=event).count()
    event.save()
    return {"success": True}

@router.delete("/event/delete/{event_id}")
def delete_event(request, event_id: int):
    event = get_object_or_404(Event, id=event_id)
    if not request.user or not request.user.is_authenticated:
        return HttpResponseForbidden("Authentication required")

    # Only allow the host to delete
    if event.host != request.user:
        return HttpResponseForbidden("You are not allowed to delete this event")

    event.delete()
    return {"success": True, "message": "Event deleted successfully"}

@router.get("/user/{user_id}")
def get_user_by_id(request, user_id: int):
    try:
        user = get_user_model().objects.get(id=user_id)
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "bio": user.bio,
            "profile_pic": user.profile_pic.url if user.profile_pic else None,
            "is_host": user.is_host,
            "is_traveler": user.is_traveler,
            "email": user.email
        }
    except UserModel.DoesNotExist:
        raise HttpError(404, "User not found")

@router.get("/host/{host_id}/events")
def get_events_by_host_id(request, host_id: int):
    try:
        user = get_user_model().objects.get(id=host_id, is_host=True)
    except UserModel.DoesNotExist:
        raise HttpError(404, "Host not found")

    events = Event.objects.filter(host=user)
    return [
        {
            "id": event.id,
            "title": event.title,
            "occurence_date": str(event.occurence_date),
            "location": event.location,
            "number_of_bookings": event.number_of_bookings,
            "photos": event.photos or [],
        }
        for event in events
    ]

@router.post("/messaging/start-dm")
def start_dm(request, payload: StartDMSchema):
    if not request.user.is_authenticated:
        raise HttpError(401, "Unauthorized")

    try:
        target = get_user_model().objects.get(id=payload.target_user_id)
    except:
        raise HttpError(404, "User not found")

    # Determine ordering
    user1, user2 = sorted([request.user, target], key=lambda u: u.id)

    # Create symmetric DM
    AllowedDM.objects.get_or_create(user1=user1, user2=user2)

    return json_response({"message": f"Mutual DM access granted between {user1.username} and {user2.username}"})

@router.get("/messaging/allowed-uids")
def get_allowed_dms(request):
    if not request.user.is_authenticated:
        raise HttpError(401, "Unauthorized")

    try:
        dms = AllowedDM.objects.filter(
            Q(user1=request.user) | Q(user2=request.user)
        )


        uids = []

        for dm in dms:
            try:
                other = dm.user2 if dm.user1 == request.user else dm.user1
                uid = other.username.replace("@", "").replace(".", "")
                uids.append(uid)
            except Exception as e:
                print(f"⚠️ Error processing AllowedDM ID={dm.id}: {e}")

        return uids

    except Exception as outer_error:
        import traceback
        print("🔥 Critical error in get_allowed_dms API:")
        print(traceback.format_exc())
        raise HttpError(500, "Server failed to retrieve allowed users")

@router.get("/tags")
def get_all_tags(request):
    tags = EventTags.objects.all()
    return json_response({"tags": [{"id": t.id, "tag_name": t.tag_name} for t in tags]})