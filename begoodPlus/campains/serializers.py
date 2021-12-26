
from catalogImages.serializers import CatalogImageApiSerializer
from .models import CampainProduct, MonthCampain, PriceTable
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers

class AdminMonthCampainSerializer(ModelSerializer):
    class Meta:
        model = MonthCampain
        fields = ('id', 'is_shown','name','users','products',)


class priceTableSerializer(ModelSerializer):
    class Meta:
        model = PriceTable
        fields = ('id', 'cach_price', 'credit_price','amount',)

class AdminProductCampainSerilizer(ModelSerializer):
    #catalogImage = CatalogImageApiSerializer('catalogImage')
    priceTable = priceTableSerializer(many=True)
    cimg = serializers.CharField(source='catalogImage.cimage')
    title = serializers.CharField(source='catalogImage.title')
    class Meta:
        model = CampainProduct
        fields = ('id','order', 'cimg','title', 'catalogImage', 'monthCampain', 'priceTable',)
