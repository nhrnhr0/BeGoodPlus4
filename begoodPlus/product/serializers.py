from productSize.models import ProductSize
from catalogImages.models import CatalogImage
from django.db import models
from django.db.models import fields
from rest_framework import serializers

from .models import Product

class ProductSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        
        
from rest_framework import generics
from color.models import Color
class PiSizesSerializer(serializers.RelatedField):
    def to_representation(self, value):
        return value.size
class PiColorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ('name', 'color')
class PiCatalogImageSerializer(serializers.ModelSerializer):
    sizes = PiSizesSerializer(read_only=True, many=True)
    colors = PiColorsSerializer(read_only=True, many=True)
    class Meta:
        model = CatalogImage
        fields = ('title','description', 'image', 'image_thumbnail','sizes','colors')

class BarcodeSerializer(serializers.ModelSerializer):
    #first_image = catalog_images
    catalog_images = PiCatalogImageSerializer(read_only=True, many=True)
    class Meta:
        model = Product
        fields = ('id', 'name', 'barcode', 'catalog_images')
        

class BarcodeList(generics.ListAPIView):
    serializer_class = BarcodeSerializer

    def get_queryset(self):
        barcode = self.kwargs['barcode']
        return Product.objects.filter(barcode=barcode)