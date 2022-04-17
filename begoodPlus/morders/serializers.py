

from rest_framework import serializers

from provider.serializers import SvelteProviderSerializer
from .models import MOrder, MOrderItem, MOrderItemEntry

class AdminMOrderItemEntrySerializer(serializers.ModelSerializer):
    color_name = serializers.CharField(source='color.name',default='',)
    size_name = serializers.CharField(source='size.size',default='',)
    varient_name = serializers.CharField(source='varient.name',default='',)
    class Meta:
        model = MOrderItemEntry
        fields = ('id', 'quantity', 'color', 'size', 'varient', 'color_name', 'size_name', 'varient_name')
    pass


        

class AdminMOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.title')
    entries = AdminMOrderItemEntrySerializer(many=True, read_only=True)
    providers = serializers.SerializerMethodField('get_providers')
    pbarcode = serializers.CharField(source='product.barcode')
    def get_providers(self, obj):
        ids = obj.providers.values_list('id', flat=True)
        return list(ids)
    class Meta:
        model = MOrderItem
        fields = ('id', 'product',  'price','providers', 'ergent', 'prining', 'embroidery', 'comment','product_name', 'entries','pbarcode',)
    

class AdminMOrderSerializer(serializers.ModelSerializer):
    products = AdminMOrderItemSerializer(many=True, read_only=True)
    client_businessName = serializers.CharField(source='client.businessName', read_only=False)
    agent_name = serializers.CharField(source='agent.username', read_only=False)
    #client_id = serializers.IntegerField(source='client.user.id', read_only=False)
    class Meta:
        model = MOrder
        fields = ('id','agent','agent_name', 'client', 'status', 'created', 'updated','message','name', 'phone', 'email', 'client_businessName', 'products')
    

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