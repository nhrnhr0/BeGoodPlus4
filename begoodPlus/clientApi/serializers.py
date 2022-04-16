


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
    topLevelCategoryOrder = serializers.IntegerField(source='topLevelCategory.my_order', read_only=True)
    class Meta:
        model = CatalogAlbum
        fields = ('id', 'title','slug','description','fotter','is_public','is_campain', 'cimage', 'topLevelCategory','topLevelCategoryOrder')#, 'first_image',)

from catalogImages.models import CatalogImageVarient
class VarientSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImageVarient
        fields = ('id','name')


class ImageClientApi(serializers.ModelSerializer):
    varients = VarientSerializer(read_only=True, many=True)
    #current_user = serializers.SerializerMethodField('_user')
    price = serializers.SerializerMethodField('_get_price')
    
    class Meta:
        model = CatalogImage
        fields = ('id','title','description','cimage','colors','sizes','varients','can_tag','discount', 'albums','amountSinglePack','amountCarton', 'show_sizes_popup', 'client_price', 'out_of_stock', 'barcode', 'has_physical_barcode','price')
        filter_backends = [DjangoFilterBackend]
        filterset_fields = ['albums']
    # Use this method for the custom field
    # def _user(self, obj):
    #     request = self.context.get('request', None)
    #     if request:
    #         if request.user.is_authenticated:
    #             return request.user.client.businessName if request.user.client else ''
    #         else:
    #             return ''
    def _get_price(self, obj):
        request = self.context.get('request', None)
        if request:
            if request.user.is_authenticated:
                if request.user.client:
                    tariff = request.user.client.tariff
                    price = obj.client_price + (obj.client_price * (tariff/100))
                    return round(price * 2) / 2 if price > 50 else "{:.2f}".format(price)
                return obj.client_price
        return 0
class ColorClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ('id', 'name', 'color')

class SizeClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ('id', 'size')