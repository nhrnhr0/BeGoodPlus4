from django.urls import reverse

from catalogAlbum.models import CatalogAlbum, TopLevelCategory
from catalogImages.models import CatalogImage
def url_to_edit_object(obj):
    url = reverse('admin:%s_%s_change' % (obj._meta.app_label,  obj._meta.model_name),  args=[obj.id] )
    return url


def fixUniqeSlug(apps=None, schema_editor=None):
    all_albums = CatalogAlbum.objects.all()
    for album in all_albums:
        album.save()
    
    
    all_top_levels = TopLevelCategory.objects.all()
    for top_level in all_top_levels:
        top_level.save()
        
    all_catalog_images = CatalogImage.objects.all()
    for catalog_image in all_catalog_images:
        catalog_image.save()