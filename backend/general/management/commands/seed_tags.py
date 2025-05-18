from django.core.management.base import BaseCommand
from general.models import EventTags

class Command(BaseCommand):
    help = 'Seed predefined event tags'

    def handle(self, *args, **kwargs):
        tags = ["music", "performance", "class", "dance", "comedy", "play", "theatre"]
        for tag in tags:
            obj, created = EventTags.objects.get_or_create(
                tag_name=tag,
                defaults={"description": f"{tag.capitalize()} events"}
            )
            status = "Created" if created else "Exists"
            self.stdout.write(f"{status}: {tag}")
