

from catalogAlbum.models import CatalogAlbum
from django.conf import settings

def navbar_load(request):
    albums = CatalogAlbum.objects.all()
    return {'albums': albums,
            'domain': settings.MY_DOMAIN,
    }