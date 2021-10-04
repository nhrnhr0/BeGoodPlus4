
from rest_framework import serializers
from customerCart.models import CustomerCart
from catalogImages.serializers import CatalogImageSerializer
class CustomerCartSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.IntegerField(read_only=True)
    products = CatalogImageSerializer(read_only=True, many=True)
    class Meta:
        model = CustomerCart
        #fields = '__all__'
        #exclude = ('colors','sizes')
        fields = ('id', 'formUUID', 'created_date', 'name', 'email', 'phone', 'sumbited', 'products',)

