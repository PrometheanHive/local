from django.contrib import admin
from .models import EventTags, Event, Review, Booking
from .models import CustomUser
from django.contrib.auth.admin import UserAdmin

# Register all models with the Django admin site
admin.site.register([EventTags, Event, Review, Booking])
admin.site.register(CustomUser, UserAdmin)