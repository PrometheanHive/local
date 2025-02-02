from ninja import Router, Schema, ModelSchema
from ninja.security import django_auth
from django.contrib import auth
from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse 
from typing import List
from . import models
from django.shortcuts import get_object_or_404


router = Router()
UserModel = auth.get_user_model()

class EventTagSchema(ModelSchema):
    class Meta:
        model = models.EventTags
        fields = '__all__'
        fields_optional = '__all__'

class EventScheme(ModelSchema):
    class Meta:
        model = models.Event
        fields = '__all__'
        fields_optional = '__all__'

class BookingScheme(ModelSchema):
    class Meta:
        model = models.Booking
        fields = '__all__'
        fields_optional = '__all__'

class UserSchema(Schema):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str


class AuthSchema(Schema):
    username:str
    password:str


class ReviewSchema(Schema):
    text: str
    rating: int
    event_id: int


    
#Events
@router.get("/event/get_all", response=List[dict])
def list_all_events(request):
    events = models.Event.objects.all().select_related('host')  # Use select_related to optimize DB queries
    event_data = [
        {
            'id': event.id,
            'title': event.title,
            'description':event.description,
            'unique_aspect': event.unique_aspect,
            'number_of_guests': event.number_of_guests,
            'number_of_bookings': event.number_of_bookings,
            'occurence_date': event.occurence_date,
            'location': event.location,
            'price': event.price,
            'host_username': event.host.username,  
            'host_first_name': event.host.first_name, 
            'photos': event.photos
        }
        for event in events
    ]
    return event_data

@router.get("/event/id/{event_id}", response=dict)
def get_experience(request, event_id: int):
    event = get_object_or_404(models.Event, id=event_id)
    print(event.host)
    event_data = {
            'id': event.id,
            'title': event.title,
            'description':event.description,
            'unique_aspect': event.unique_aspect,
            'number_of_guests': event.number_of_guests,
            'number_of_bookings': event.number_of_bookings,
            'occurence_date': event.occurence_date,
            'location': event.location,
            'price': event.price,
            'host_username': event.host.username,  
            'host_first_name': event.host.first_name,
            "photos": event.photos
        }
    return event_data

#Example of an endpoint that needs auth. Passing in the auth=django_auth for auth
@router.get("/user", auth=django_auth)
def get_user(request):
    print(request.user)
    if request.user.is_authenticated:
        return {"username": request.user.first_name, "email": request.user.email}
    else:
        return JsonResponse({"error": "Not authenticated"}, status=401)

@router.post("/user/create")
def create_user(request, payload: UserSchema):
    print(request)
    print(payload.dict())
    user = UserModel.objects.create_user(**payload.dict())
    print("created user")
    print(user)
    return {'id': user.id}

@router.post("user/authenticate")
def authenticate_user(request, payload: AuthSchema):
    user = authenticate(**payload.dict())
    if user is not None: 
        login(request, user)    
        return {"message": "User authenticated successfully", "user_id": user.id}
    else: 
        # If authentication fails, return an error message
        return {"message":"Error authenticating user"}
        #raise HttpError(401, "Invalid username or password")

@router.post("/user/logout")
def logout_user(request):
    logout(request) 
    response = JsonResponse({"message": "User logged out successfully"}) 
    response.delete_cookie('sessionid', samesite='Lax')  # Example adjustment
    return response


 #Reviews 
@router.post("/reviews/create")
def create_review(request, payload: ReviewSchema):
    event = get_object_or_404(models.Event, id=payload.event_id)
    review = models.Review.objects.create(
        text=payload.text,
        rating=payload.rating,
        event=event,
    )
    return {"id": review.id, "message": "Review created successfully"}

@router.get("/event/{event_id}/reviews", response=List[ReviewSchema])
def list_reviews_for_event(request, event_id: int):
    event = get_object_or_404(models.Event, id=event_id)
    reviews = event.reviews.all()  # Using the related_name 'reviews' defined in the Review model
    return reviews   

@router.post("/event/create", auth=django_auth)
def create_event(request, payload: EventScheme):
    if request.user.is_authenticated:
        print(request)
        print(payload.dict())
        payload_dict = payload.dict()
        host = request.user
        # Remove host key from payload dictionary
        payload_dict['host'] = host
        event = models.Event.objects.create(
                **payload_dict
            )
        print("created event")
        print(event)
        return {'id': event.id}
    else: 
        return JsonResponse({"error": "Not authenticated"}, status=401)

@router.post("/booking/register/{event_id}", auth=django_auth)
def register_booking(request, event_id: int):
    if request.user.is_authenticated:
        print(request.user.id)
        print(event_id)
        event = get_object_or_404(models.Event, id=event_id)
        guest = request.user
        if not models.Booking.objects.filter(event=event, guest=guest).exists():
            booking = models.Booking.objects.create(
                event=event,
                guest=guest
            )
            print(booking)
            event.number_of_bookings += 1
            event.save()
            return {"id": booking.id, "message": "booking created successfully"}
        booking =  get_object_or_404(models.Booking, event=event, guest=guest)
        return {"id": booking.id, "message": "booking already made"}
    else: 
        return JsonResponse({"error": "Not authenticated"}, status=401)


#Get bookings 
@router.get("/user/bookings", auth=django_auth)
def get_user_bookings(request):
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
        return booking_data
    else:
        return JsonResponse({"error": "Not authenticated"}, status=401)
