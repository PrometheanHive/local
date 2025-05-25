from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Event, Booking, Review, EventTags, AllowedDM
from django import forms
from django.utils.safestring import mark_safe

class EventAdminForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = "__all__"

    def clean_photos(self):
        # Optional: validate or clean photo data
        return self.cleaned_data.get("photos")

    def render_photo_previews(self):
        photos = self.instance.photos or []
        html = ""
        for url in photos:
            if url:
                full_url = url if url.startswith("/") else f"/media/{url}"
                html += f'<img src="{full_url}" height="100" style="margin:5px; border:1px solid #ccc;" />'
        return mark_safe(html)


# ✅ Register Event with custom admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    form = EventAdminForm
    readonly_fields = ("photo_previews",)
    list_display = ("title", "host", "approved", "occurence_date")
    list_filter = ("approved",)
    search_fields = ("title", "description", "location")
    
    fieldsets = (
        (None, {
            "fields": ("title", "description", "unique_aspect", "occurence_date", "location", "price")
        }),
        ("Media", {
            "fields": ("photos", "photo_previews")
        }),
        ("Host & Meta", {
            "fields": ("host", "number_of_guests", "number_of_bookings", "approved", "tags")
        }),
    )

    def photo_previews(self, obj):
        return EventAdminForm(instance=obj).render_photo_previews()
    photo_previews.short_description = "Photo Previews"


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
