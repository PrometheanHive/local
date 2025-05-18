from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as geomodels 

class EventTags(models.Model):
    tag_name = models.CharField(max_length=200, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.tag_name


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    unique_aspect = models.TextField(blank=True)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='hosted_events')
    created_at = models.DateTimeField(default=now)
    number_of_guests = models.PositiveIntegerField(default=1, blank=True, null=True)
    number_of_bookings = models.PositiveIntegerField(default=0)
    occurence_date = models.DateTimeField(blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    tags = models.ManyToManyField(EventTags, blank=True, related_name='events')

    # NEW GEO INFO
    location = models.CharField(max_length=255)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    #point = geomodels.PointField(geography=True, blank=True, null=True)

    price = models.DecimalField(default=0.00, max_digits=10, decimal_places=2, blank=True, null=True)
    photos = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.title


class Review(models.Model):
    text = models.TextField()
    rating = models.PositiveIntegerField(default=1)  # Ensure only valid ratings (1-5)
    event = models.ForeignKey(Event, related_name='reviews', on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=now)

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(rating__gte=1) & models.Q(rating__lte=5), name='valid_rating_range'),
        ]

    def __str__(self):
        return f"Review for {self.event.title} - Rating: {self.rating}"


class Booking(models.Model):
    event = models.ForeignKey(Event, related_name='bookings', on_delete=models.CASCADE)
    guest = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    created_at = models.DateTimeField(default=now)  # Explicit default

    class Meta:
        unique_together = ('event', 'guest')  # Prevent duplicate bookings

    def __str__(self):
        return f"{self.guest.username} booked {self.event.title}"


def user_profile_pic_path(instance, filename):
    return f'profile_pics/user_{instance.id}/{filename}'

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    profile_pic = models.ImageField(upload_to=user_profile_pic_path, blank=True, null=True)
    is_traveler = models.BooleanField(default=False)
    is_host = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=50, null=True, blank=True)  # <-- ADD THIS

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class AllowedDM(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dm_user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dm_user2')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('user1', 'user2'),)

    def save(self, *args, **kwargs):
        # Always store the lower user ID first for consistency
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"DM: {self.user1.username} ⇄ {self.user2.username}"

