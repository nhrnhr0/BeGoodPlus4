

from rest_framework import serializers
from .models import MOrder, MOrderItem

class AdminMOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.title')
    color_name = serializers.CharField(source='color.name', allow_null=True, default=None)
    size_name = serializers.CharField(source='size.size', allow_null=True, default=None)
    varient_name = serializers.CharField(source='varient.name', allow_null=True, default=None)
    class Meta:
        model = MOrderItem
        fields = ('id', 'product', 'quantity', 'price', 'color', 'size', 'varient', 'provider', 'clientProvider', 'clientBuyPrice', 'ergent', 'prining', 'embroidery', 'comment','product_name','color_name','size_name','varient_name')
    

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