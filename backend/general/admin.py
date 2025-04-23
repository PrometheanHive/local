from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Event, Booking, Review, EventTags, AllowedDM


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {
            "fields": ("bio", "profile_pic", "is_traveler", "is_host"),
        }),
    )

    list_display = (
        "username", "email", "first_name", "last_name",
        "is_staff", "is_traveler", "is_host"
    )

    search_fields = ("email", "username", "first_name", "last_name")

# Register other models
admin.site.register([Event, Booking, Review, EventTags, AllowedDM])
