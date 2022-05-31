

from email.policy import default
from django.http import JsonResponse
from rest_framework import serializers
from catalogImages.models import CatalogImage
from inventory.models import WarehouseStock
from inventory.serializers import WarehouseStockSerializer
from catalogImages.serializers import CatalogImageSerializer
from django.db.models import Sum, Avg
from django.db.models import OuterRef, Subquery
from provider.serializers import SvelteProviderSerializer
from .models import MOrder, MOrderItem, MOrderItemEntry, TakenInventory
from django.db import models
from django.db.models import Q

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
        # serializer_context = {'request': self.context.get('request') }
        # product = CatalogImage.objects.get(id=obj.product.id)
        # serializer = CatalogImageSerializer(product, many=False, context=serializer_context)
        # return serializer.data
        product = CatalogImage.objects.get(id=obj.product.id)
        return {
            'id': product.id,
            'title': product.title,
            'cimage': product.cimage,
            'barcode': product.barcode,
        }
    
    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)
    def get_available_inventory(self, obj):
        # all the available stock in all the warhoused and sum the quantity for every product, size,color,varient, ppn__has_phisical_barcode,ppn__provider__name,ppn__barcode
        stock = WarehouseStock.objects.select_related('size','color', 'verient', 'ppn','product').values('size', 'color', 'verient','ppn__barcode', 'ppn__has_phisical_barcode','ppn__provider__name',) \
            .order_by('size', 'color', 'verient', 'ppn__barcode', 'ppn__has_phisical_barcode','ppn__provider__name',) \
            .filter(ppn__product=obj.product) \
                .annotate(total=Sum('quantity'))
        # get all the orders for this product frozen
        taken_in_other_orders = TakenInventory.objects.select_related('product', 'size', 'color', 'varient', 'provider').filter(~Q(product=obj),Q(product__product__id=obj.product.id), Q(product__morder__freezeTakenInventory=True), Q(product__morder__archive=False)).annotate(total=Sum('quantity')).values('size', 'color', 'varient','barcode', 'has_physical_barcode','provider__name',) \
            .order_by('size', 'color', 'varient', 'barcode', 'has_physical_barcode','provider__name',) \
                    .annotate(total=Sum('quantity'))
        # frozzenOrders = MOrder.objects.filter(freezeTakenInventory=True)
        # for order in frozzenOrders:
        #     taken = order.taken.filter(product=obj.product)
        # obj <MOrderItem: גרבי כותנה | 444.00₪>
        # stock 
        # {'size': 117, 'color': 77, 'verient': None, 'ppn__barcode': '', 'ppn__has_phisical_barcode': False, 'ppn__provider__name': 'המלביש', 'total': 20},
        # {'size': 118, 'color': 77, 'verient': None, 'ppn__barcode': '', 'ppn__has_phisical_barcode': False, 'ppn__provider__name': 'המלביש', 'total': 20},
        # {'size': 117, 'color': 78, 'verient': None, 'ppn__barcode': '', 'ppn__has_phisical_barcode': False, 'ppn__provider__name': 'המלביש', 'total': 10},
        # taken
        # {'size': 117, 'color': 77, 'varient': None, 'barcode': '', 'has_physical_barcode': False, 'provider__name': 'המלביש', 'total': 1}, 
        # {'size': 118, 'color': 77, 'varient': None, 'barcode': '', 'has_physical_barcode': False, 'provider__name': 'המלביש', 'total': 3},
        for s in stock:
            s['taken'] = obj.taken.filter(barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color'], varient=s['verient']).aggregate(Sum('quantity'))['quantity__sum'] or 0
            s['total_with_freeze'] = s['total']
            frozen_inventory = taken_in_other_orders.filter(barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color'], varient=s['verient']).aggregate(Sum('quantity'))['quantity__sum'] or 0
            #toOrder          = taken.filter(barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color'], varient=s['verient']).aggregate(Sum('toOrder'))
            s['frozen'] = frozen_inventory
            s['total'] = s['total'] - frozen_inventory
            #s['toOrder'] = TakenInventory.objects.select_related('product', 'size', 'color', 'varient', 'provider').filter(product=obj,color=s['color'],size=s['size'],varient=s['verient'],barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'],provider__name=s['ppn__provider__name']).aggregate(Sum('toOrder'))['toOrder__sum'] or 0
            
                    #taken=Subquery(obj.taken.filter(size=OuterRef('size'), color=OuterRef('color'), varient=OuterRef('verient'), barcode=OuterRef('ppn__barcode'), has_physical_barcode=OuterRef('ppn__has_phisical_barcode'), provider__name=OuterRef('ppn__provider__name'),output_field='quantity')))
        #data = WarehouseStockSerializer(stock, many=True).data
        #data = django_serializers.serialize('json', stock, fields=('size', 'color', 'verient','ppn__barcode', 'ppn__has_phisical_barcode', 'total'))
        ret = list(stock)
        return ret
    
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
        fields = ('id','agent','agent_name', 'client', 'status', 'created', 'updated','message','name', 'phone', 'email', 'client_businessName', 'products','freezeTakenInventory','isOrder')
    

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