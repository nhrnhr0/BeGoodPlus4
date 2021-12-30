
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
        fields = ('id', 'cach_price', 'credit_price','amount',)

class ClientProductCampainSerilizer(ModelSerializer):
    catalogImage = ImageClientApi('catalogImage') # 
    priceTable = priceTableSerializer(many=True)
    #cimg = serializers.CharField(source='catalogImage.cimage')
    #title = serializers.CharField(source='catalogImage.title')
    class Meta:
        model = CampainProduct
        fields = ('id', 'priceTable','catalogImage')

class ClientMonthCampainSerializer(ModelSerializer):
    #priceTable = ClientProductCampainSerilizer(many=True)
    products = ClientProductCampainSerilizer(many=True, source='campainproduct_set')
    album = AlbumClientApi()
    class Meta:
        model = MonthCampain
        fields = ('id', 'name', 'is_shown', 'products','album', 'endTime')
        

class AdminMonthCampainSerializer(ModelSerializer):
    class Meta:
        model = MonthCampain
        fields = ('id', 'is_shown','name','users','products',)




class AdminProductCampainSerilizer(ModelSerializer):
    #catalogImage = CatalogImageApiSerializer('catalogImage')
    priceTable = priceTableSerializer(many=True)
    cimg = serializers.CharField(source='catalogImage.cimage')
    title = serializers.CharField(source='catalogImage.title')
    class Meta:
        model = CampainProduct
        fields = ('id','order', 'cimg','title', 'catalogImage', 'monthCampain', 'priceTable',)
