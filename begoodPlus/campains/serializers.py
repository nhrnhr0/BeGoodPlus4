
from django.db import models
from django.db.models import fields

from clientApi.serializers import AlbumClientApi
from catalogImages.serializers import CatalogImageApiSerializer
from clientApi.serializers import ImageClientApi
from .models import CampainProduct, MonthCampain, PriceTable
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers


class priceTableSerializer(ModelSerializer):
    class Meta:
        model = PriceTable
        fields = ('id', 'cach_price', 'credit_price', 'amount',)


class ClientProductCampainSerilizer(ModelSerializer):
    #priceTable = priceTableSerializer(many=True)
    id = serializers.CharField(source='catalogImage.id')
    title = serializers.CharField(source='catalogImage.title')
    cimage = serializers.CharField(source='catalogImage.cimage')
    #cimg = serializers.CharField(source='catalogImage.cimage')
    #title = serializers.CharField(source='catalogImage.title')

    class Meta:
        model = CampainProduct
        fields = ('id', 'title', 'cimage', 'newPrice', )


class ClientMonthCampainSerializer(ModelSerializer):
    #priceTable = ClientProductCampainSerilizer(many=True)
    # products = ClientProductCampainSerilizer(
    #     many=True, source='campainproduct_set')
    #album = AlbumClientApi()
    id = serializers.CharField(source='album.id')
    slug = serializers.CharField(source='album.slug')
    get_image = serializers.CharField(source='album.cimage')
    is_campain = serializers.CharField(source='album.is_campain')
    is_public = serializers.CharField(source='album.is_public')
    album_order = serializers.CharField(source='album.album_order')

    class Meta:
        model = MonthCampain
        fields = ('id', 'name', 'slug', 'get_image', 'is_shown',
                  'endTime', 'is_campain', 'is_public', 'album_order',)


class AdminMonthCampainSerializer(ModelSerializer):
    slug = serializers.CharField(source='album.slug')
    get_image = serializers.CharField(source='album.cimage')

    class Meta:
        model = MonthCampain
        fields = ('id', 'is_shown', 'name', 'users',
                  'products', 'slug', 'get_image')


class AdminProductCampainSerilizer(ModelSerializer):
    #catalogImage = CatalogImageApiSerializer('catalogImage')
    #priceTable = priceTableSerializer(many=True)
    cimg = serializers.CharField(source='catalogImage.cimage')
    title = serializers.CharField(source='catalogImage.title')
    cost_price = serializers.CharField(source='catalogImage.cost_price')
    client_price = serializers.CharField(source='catalogImage.client_price')

    class Meta:
        model = CampainProduct
        fields = ('id', 'order', 'cimg', 'title', 'catalogImage',
                  'monthCampain', 'newPrice', 'cost_price', 'client_price',)
