from django.shortcuts import render
from catalogImages.models import CatalogImage
from clientApi.serializers import ImageClientApi
from clientApi.serializers import AlbumClientApi
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from catalogAlbum.models import CatalogAlbum

# Create your views here.
class AlbumClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogAlbum.objects.all()
    serializer_class = AlbumClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class ImageClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()
    serializer_class = ImageClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]