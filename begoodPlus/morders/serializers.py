

from email.policy import default
from django.http import JsonResponse
from rest_framework import serializers
from catalogImages.models import CatalogImage
from inventory.models import WarehouseStock
from inventory.serializers import WarehouseStockSerializer
from catalogImages.serializers import CatalogImageSerializer
from django.db.models import Sum
from django.db.models import OuterRef, Subquery
from provider.serializers import SvelteProviderSerializer
from .models import MOrder, MOrderItem, MOrderItemEntry
from django.db import models

from django.core import serializers as django_serializers

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
    product_cimage = serializers.CharField(source='product.cimage')
    entries = AdminMOrderItemEntrySerializer(many=True, read_only=True)
    providers = serializers.SerializerMethodField('get_providers')
    pbarcode = serializers.CharField(source='product.barcode')
    # colors = serializers.SerializerMethodField('get_colors')
    # sizes = serializers.SerializerMethodField('get_sizes')
    # verients = serializers.SerializerMethodField('get_verients')
    available_inventory = serializers.SerializerMethodField('get_available_inventory')
    product = serializers.SerializerMethodField('get_product_serializer')
    
    def get_product_serializer(self, obj):
        serializer_context = {'request': self.context.get('request') }
        product = CatalogImage.objects.get(id=obj.product.id)
        serializer = CatalogImageSerializer(product, many=False, context=serializer_context)
        return serializer.data
    
    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)
    def get_available_inventory(self, obj):
        stock = WarehouseStock.objects.values('size', 'color', 'verient','ppn__barcode', 'ppn__has_phisical_barcode','ppn__provider__name',) \
            .order_by('size', 'color', 'verient', 'ppn__barcode', 'ppn__has_phisical_barcode','ppn__provider__name',) \
            .filter(ppn__product=obj.product) \
                .annotate(total=Sum('quantity'),)
                
        for s in stock:
            s['taken'] = obj.taken.filter(barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color']).aggregate(Sum('quantity'))['quantity__sum'] or 0
                    #taken=Subquery(obj.taken.filter(size=OuterRef('size'), color=OuterRef('color'), varient=OuterRef('verient'), barcode=OuterRef('ppn__barcode'), has_physical_barcode=OuterRef('ppn__has_phisical_barcode'), provider__name=OuterRef('ppn__provider__name'),output_field='quantity')))
        #data = WarehouseStockSerializer(stock, many=True).data
        #data = django_serializers.serialize('json', stock, fields=('size', 'color', 'verient','ppn__barcode', 'ppn__has_phisical_barcode', 'total'))
        return list(stock)
    
    def get_sizes(self, obj):
        ids = obj.product.sizes.values_list('id', flat=True)
        return list(ids)
    
    def get_colors(self, obj):
        ids = obj.product.colors.values_list('id', flat=True)
        return list(ids)
    
    def get_verients(self, obj):
        ids = obj.product.varients.values_list('id', flat=True)
        return list(ids)
    
    def get_providers(self, obj):
        ids = obj.providers.values_list('id', flat=True)
        return list(ids)
    class Meta:
        model = MOrderItem
        fields = ('id', 'product',  'price','providers', 'ergent', 'prining', 'embroidery', 'comment','product_name', 'entries','pbarcode','product_cimage','available_inventory','product','priningComment','embroideryComment',)
    

class AdminMOrderListSerializer(serializers.ModelSerializer):
    client_businessName = serializers.CharField(source='client.businessName', read_only=False, default='')
    agent_name = serializers.CharField(source='agent.username', read_only=False, default='')
    total_price = serializers.SerializerMethodField('get_total_price')
    products_count = serializers.SerializerMethodField('get_products_count')
    
    def get_total_price(self, obj):
        return obj.prop_totalPrice
    def get_products_count(self, obj):
        return obj.products.count()
    
    class Meta:
        model = MOrder
        #order_by = ('created','id')
        fields = ('id', 'agent', 'agent_name', 'client', 'status', 'created', 'updated', 'message', 'name', 'phone', 'email', 'client_businessName','total_price','products_count',)

class AdminMOrderSerializer(serializers.ModelSerializer):
    products = AdminMOrderItemSerializer(many=True, read_only=True)
    client_businessName = serializers.CharField(source='client.businessName', read_only=False, default='')
    agent_name = serializers.CharField(source='agent.username', read_only=False, default='')
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