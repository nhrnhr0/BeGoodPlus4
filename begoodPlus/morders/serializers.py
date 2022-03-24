

from rest_framework import serializers
from .models import MOrder, MOrderItem, MOrderItemEntry

class AdminMOrderItemEntrySerializer(serializers.ModelSerializer):
    color_name = serializers.CharField(source='color.name',default='',)
    size_name = serializers.CharField(source='size.size',default='',)
    varient_name = serializers.CharField(source='varient.name',default='',)
    class Meta:
        model = MOrderItemEntry
        fields = ('quantity', 'color', 'size', 'varient', 'color_name', 'size_name', 'varient_name')
    pass

class AdminMOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.title')
    entries = AdminMOrderItemEntrySerializer(many=True, read_only=True)
    class Meta:
        model = MOrderItem
        fields = ('id', 'product',  'price','provider', 'ergent', 'prining', 'embroidery', 'comment','product_name', 'entries')
    

class AdminMOrderSerializer(serializers.ModelSerializer):
    products = AdminMOrderItemSerializer(many=True, read_only=True)
    client_businessName = serializers.CharField(source='client.businessName', read_only=False)
    #client_id = serializers.IntegerField(source='client.user.id', read_only=False)
    class Meta:
        model = MOrder
        fields = ('id','client', 'status', 'created', 'updated','message','name', 'phone', 'email', 'client_businessName', 'products')
    

'''
product
quantity
price
color
size
varient
provider
clientProvider
clientBuyPrice
ergent
prining
embroidery
comment
'''