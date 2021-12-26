
from .models import CampainProduct, MonthCampain
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers

class AdminMonthCampainSerializer(ModelSerializer):
    class Meta:
        model = MonthCampain
        fields = ('id', 'is_shown','name','users','products',)
        
class AdminProductCampainSerilizer(ModelSerializer):
    #title = serializers.ReadOnlyField(source='catalogImage.title')
    class Meta:
        model = CampainProduct
        #fields = (, 'priceTable', 'amountBrakepoint', 'paymentType',)
        fields = ('id',)
