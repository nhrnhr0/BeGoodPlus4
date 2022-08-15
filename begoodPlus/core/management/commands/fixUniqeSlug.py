from django.core.management.base import BaseCommand
from catalogAlbum.models import CatalogAlbum, TopLevelCategory
from catalogImages.models import CatalogImage
class Command(BaseCommand):
    
    def handle(self, *args, **options):
        all_albums = CatalogAlbum.objects.all()
        for album in all_albums:
            album.save()
        
        
        all_top_levels = TopLevelCategory.objects.all()
        for top_level in all_top_levels:
            top_level.save()
            
        all_catalog_images = CatalogImage.objects.all()
        for catalog_image in all_catalog_images:
            catalog_image.save()
    print('done')