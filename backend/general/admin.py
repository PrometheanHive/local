from django.contrib import admin
from .models import EventTags, Event, Review, Booking

# Register all models with the Django admin site
admin.site.register([EventTags, Event, Review, Booking])