from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Event, Booking, Review, EventTags, AllowedDM

# ✅ Register Event with custom admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "host", "approved", "occurence_date")
    list_filter = ("approved",)
    search_fields = ("title", "description", "location")

# ✅ Register CustomUser with custom admin
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

# ✅ Register other models without Event (already registered above)
admin.site.register(Booking)
admin.site.register(Review)
admin.site.register(EventTags)
admin.site.register(AllowedDM)
