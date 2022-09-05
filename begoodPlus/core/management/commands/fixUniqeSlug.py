from django.core.management.base import BaseCommand
from catalogAlbum.models import CatalogAlbum, TopLevelCategory
from catalogImages.models import CatalogImage
from core.utils import fixUniqeSlug
class Command(BaseCommand):
    
    def handle(self, *args, **options):
        fixUniqeSlug()
        print('done')
    
