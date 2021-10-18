from rest_framework.response import Response
from django.http.response import JsonResponse
from django.shortcuts import render
from catalogImages.models import CatalogImage
from clientApi.serializers import ImageClientApi
from clientApi.serializers import AlbumClientApi
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from catalogAlbum.models import CatalogAlbum
from rest_framework.renderers import JSONRenderer

# Create your views here.
class AlbumClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogAlbum.objects.all()
    serializer_class = AlbumClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class ImageClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()
    serializer_class = ImageClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer

@api_view(('GET',))
@renderer_classes((JSONRenderer,))
def get_album_images(request, pk):
    album = CatalogAlbum.objects.get(id=pk)
    images = album.images
    ser = ImageClientApi(images, many=True)
    return Response(ser.data)

