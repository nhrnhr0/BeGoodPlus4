from rest_framework.response import Response
from django.http.response import JsonResponse
from django.shortcuts import render
from catalogImages.models import CatalogImage
from clientApi.serializers import ColorClientApi, ImageClientApi, SizeClientApi
from clientApi.serializers import AlbumClientApi, LogoClientApi
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from catalogAlbum.models import CatalogAlbum
from rest_framework.renderers import JSONRenderer
from catalogLogos.models import CatalogLogo
from core.views import get_session_key
from productColor.models import ProductColor
from productSize.models import ProductSize
class LogoClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogLogo.objects.all()
    serializer_class = LogoClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
# Create your views here.
class AlbumClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogAlbum.objects.all()
    serializer_class = AlbumClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class ImageClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()#.prefetch_related('colors','sizes','providers','detailTabel')
    serializer_class = ImageClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]



class ColorsClientViewSet(viewsets.ModelViewSet):
    queryset = ProductColor.objects.all()
    serializer_class = ColorClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]

class SizesClientViewSet(viewsets.ModelViewSet):
    queryset = ProductSize.objects.all()
    serializer_class = SizeClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.views.decorators.cache import cache_page
import functools
from django.db import connection

@api_view(('GET',))
@renderer_classes((JSONRenderer,))
def get_album_images(request, pk):
    album = CatalogAlbum.objects.get(id=pk)
    images = album.images.order_by('throughimage__image_order')
    images = images.prefetch_related('colors','sizes','albums').select_related('packingTypeClient')
    ser = ImageClientApi(images, many=True)
    data = ser.data
    print(connection.queries)
    print(len(connection.queries))
    
    return Response(data)