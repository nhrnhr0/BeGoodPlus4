


from django.db import models
from catalogImages.models import CatalogImage
from catalogAlbum.models import CatalogAlbum
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend

from productColor.models import ProductColor
from productSize.models import ProductSize
from catalogLogos.models import CatalogLogo

class LogoClientApi(serializers.ModelSerializer):
    class Meta:
        model = CatalogLogo
        fields = ('id', 'title', 'cimg')

class AlbumClientApi(serializers.ModelSerializer):
    class Meta:
        model = CatalogAlbum
        fields = ('id', 'title','slug','description','fotter','is_public')

class ImageClientApi(serializers.ModelSerializer):
    class Meta:
        model = CatalogImage
        fields = ('id','title','description','cimage','colors','sizes','can_tag','discount', 'albums') 
        filter_backends = [DjangoFilterBackend]
        filterset_fields = ['albums']

class ColorClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ('id', 'name', 'color')

class SizeClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ('id', 'size')