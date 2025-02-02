from django.contrib import admin
from .models import EventTags, Event

# Register your models here.
admin.site.register([EventTags, Event])