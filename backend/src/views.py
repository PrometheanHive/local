from django.shortcuts import render
from django.core.mail import send_mail
from django.http import HttpResponse
import logging
# Create your views here.
logger = logging.getLogger(__name__)

def test_email_view(request):
    logger.info("🔥 Test email view was hit.")
    send_mail(
        subject='Test Email from Local',
        message='This is a test message from your Django app.',
        from_email=None,  # Uses DEFAULT_FROM_EMAIL
        recipient_list=['experiencebylocals@gmail.com'],
        fail_silently=False,
    )
    return HttpResponse("Test email sent!")