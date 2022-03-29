


from django.db import models
from catalogImages.serializers import CatalogImageSerializer
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

class FirstImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImage
        fields = ('id','title', 'cimage')

class AlbumClientApi(serializers.ModelSerializer):
    '''first_image = serializers.SerializerMethodField('_get_first_image')
    def _get_first_image(self, obj):
        serializer = FirstImageSerializer(obj.images.order_by("throughimage__image_order").first(),context=self.context,)
        return serializer.data
    '''
    topLevelCategory = serializers.CharField(source='topLevelCategory.name', read_only=True)
    class Meta:
        model = CatalogAlbum
        fields = ('id', 'title','slug','description','fotter','is_public','is_campain', 'cimage', 'topLevelCategory')#, 'first_image',)

from catalogImages.models import CatalogImageVarient
class VarientSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImageVarient
        fields = ('id','name')


class ImageClientApi(serializers.ModelSerializer):
    varients = VarientSerializer(read_only=True, many=True)
    class Meta:
        model = CatalogImage
        fields = ('id','title','description','cimage','colors','sizes','varients','can_tag','discount', 'albums','amountSinglePack','amountCarton', 'show_sizes_popup', 'client_price')
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