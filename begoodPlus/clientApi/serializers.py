

from morders.models import MorderStatus
from catalogImages.models import CatalogImageVarient
from django.db import models
from campains.models import MonthCampain, CampainProduct
from catalogImages.serializers import CatalogImageSerializer
from catalogImages.models import CatalogImage
from catalogAlbum.models import CatalogAlbum
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend
import decimal
from core.pagination import StandardResultsSetPagination
from productColor.models import ProductColor
from productSize.models import ProductSize
from catalogLogos.models import CatalogLogo
from datetime import datetime
import pytz
from client.models import Client


class LogoClientApi(serializers.ModelSerializer):
    class Meta:
        model = CatalogLogo
        fields = ('id', 'title', 'cimg')


class FirstImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImage
        fields = ('id', 'title', 'cimage')


class AlbumClientApi(serializers.ModelSerializer):
    '''first_image = serializers.SerializerMethodField('_get_first_image')
    def _get_first_image(self, obj):
        serializer = FirstImageSerializer(obj.images.order_by("throughimage__image_order").first(),context=self.context,)
        return serializer.data
    '''
    topLevelCategory = serializers.CharField(
        source='topLevelCategory.name', read_only=True)
    topLevelCategoryOrder = serializers.IntegerField(
        source='topLevelCategory.my_order', read_only=True)

    class Meta:
        model = CatalogAlbum
        fields = ('id', 'title', 'slug', 'description', 'fotter', 'is_public', 'is_campain',
                  'cimage', 'topLevelCategory', 'topLevelCategoryOrder')  # , 'first_image',)


class VarientSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImageVarient
        fields = ('id', 'name')


class MorderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MorderStatus
        fields = ('id', 'name', 'sort_order')


class ImageClientApi(serializers.ModelSerializer):
    varients = VarientSerializer(read_only=True, many=True)
    #current_user = serializers.SerializerMethodField('_user')
    price = serializers.SerializerMethodField('_get_price')
    newPrice = serializers.SerializerMethodField('_get_new_price')
    link = serializers.SerializerMethodField('_get_link')

    class Meta:
        model = CatalogImage
        fields = ('id', 'title', 'description', 'cimage', 'colors', 'sizes', 'varients', 'can_tag', 'discount', 'albums', 'amountSinglePack',
                  'amountCarton', 'show_sizes_popup', 'out_of_stock', 'barcode', 'has_physical_barcode', 'price', 'newPrice', 'link')
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

    def _get_link(self, obj):
        return '/main?' + 'top=' + obj.main_public_album.topLevelCategory.slug + '&album=' + obj.main_public_album.slug + '&product_id=' + str(obj.id)

    def _get_new_price(self, obj):
        request = self.context.get('request', None)
        if request:
            if request.user.is_authenticated and request.user.client:
                if request.user.client:
                    catalogImage_id = obj.id
                    if request.user.is_superuser and (request.GET.get('actAs') or request.COOKIES.get('actAs')):
                        user_id = request.GET.get(
                            'actAs') or request.COOKIES.get('actAs')
                    else:
                        user_id = request.user.id
                    # check if the product is in any campaign of the client
                    # campain = MonthCampain.objects.filter(users__user_id=user_id, products__id=catalogImage_id).first()
                    # israel
                    tz = pytz.timezone('Israel')

                    campainProduct = CampainProduct.objects.filter(monthCampain__users__user_id=user_id, catalogImage_id=catalogImage_id,
                                                                   monthCampain__is_shown=True, monthCampain__startTime__lte=datetime.now(tz), monthCampain__endTime__gte=datetime.now(tz)).first()
                    #campainProduct = campainProduct.first()
                    if campainProduct:
                        return campainProduct.newPrice
                return None
        return None

    def _get_price(self, obj):
        request = self.context.get('request', None)
        if request:
            if request.user.is_authenticated and request.user.client:
                if request.user.client:
                    tariff = request.user.client.tariff
                    if request.user.is_superuser and (request.GET.get('actAs') or request.COOKIES.get('actAs')):
                        user_id = request.GET.get(
                            'actAs') or request.COOKIES.get('actAs')
                        client = Client.objects.get(user_id=user_id)
                        tariff = client.tariff
                else:
                    tariff = 0
                price = obj.client_price + (obj.client_price * (tariff/100))
                price = round(price * 2) / \
                    2 if price > 50 else "{:.2f}".format(price)
                ret = decimal.Decimal(price).normalize()
                ret = float(ret)
                return ret
        return 0


class ColorClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ('id', 'name', 'color', )
        # 'code',


class SizeClientApi(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ('id', 'size', 'code')
