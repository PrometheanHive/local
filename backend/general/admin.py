from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Event, Booking, Review, EventTags, AllowedDM


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {
            "fields": ("bio", "profile_pic", "is_traveler", "is_host", "auth_provider"),
        }),
    )

    list_display = (
        "username", "email", "first_name", "last_name",
        "is_staff", "is_traveler", "is_host", "auth_provider"
    )

    search_fields = ("email", "username", "first_name", "last_name", "auth_provider")

# Register other models
admin.site.register([Event, Booking, Review, EventTags, AllowedDM])
