from django.db import models
from django.conf import settings
from django.utils import timezone
import datetime
from ninja import ModelSchema
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model



#TODO chance from "all" tags, this is super insecure

class EventTags(models.Model):
    tag_name = models.CharField(max_length=200)
    description = models.TextField()


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unique_aspect = models.TextField(blank=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='host')
    created_at = models.DateTimeField( blank=True, null=True)
    #tags = models.ManyToManyField(EventTags,  blank=True)
    number_of_guests = models.PositiveIntegerField(default=1, blank=True, null=True)
    number_of_bookings = models.PositiveIntegerField(default=0, blank=False, null=False)
    #guest_list = models.ManyToManyField(settings.AUTH_USER_MODEL,  blank=True, related_name='guest_list')
    occurence_date = models.DateTimeField( blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    location = models.TextField(blank=True, null=True) #TODO change this to be better
    price = models.DecimalField(default=0, max_digits=19, decimal_places = 4, blank=True, null=True) #TODO change to to be better
    photos = models.JSONField(blank=True, null=True)


class Review(models.Model):
    text = models.TextField()
    rating = models.IntegerField()
    event = models.ForeignKey('Event', related_name='reviews', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.event.title}"
    
class Booking(models.Model):
    event = models.ForeignKey('Event', related_name='fk_booking_to_event', on_delete=models.CASCADE)
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fk_booking_to_guest')

