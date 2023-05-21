

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
from .models import CollectedInventory, MOrder, MOrderItem, MOrderItemEntry, ProviderRequest, TakenInventory
from django.db import models
from django.db.models import Q

from django.core import serializers as django_serializers


class AdminMOrderItemEntrySerializer(serializers.ModelSerializer):
    color_name = serializers.CharField(source='color.name', default='',)
    size_name = serializers.CharField(source='size.size', default='',)
    varient_name = serializers.CharField(source='varient.name', default='',)

    class Meta:
        model = MOrderItemEntry
        fields = ('id', 'quantity', 'color', 'size', 'varient',
                  'color_name', 'size_name', 'varient_name')
    pass


class AdminProviderResuestSerializerWithMOrder(serializers.ModelSerializer):
    '''
        id
        provider
        size
        varient
        color
        force_physical_barcode
        quantity
        orderItem__product
        orderItem__morder
    '''
    morder = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    def get_morder(self, originalObj):
        obj = originalObj.orderItem.first()
        #print('get_morder', obj)
        if obj:
            return obj.morder.first().id
        return ''

    def get_product(self, originalObj):
        obj = originalObj.orderItem.first()
        #print('get_product', obj)
        if obj:
            return {'id': obj.product.id, 'title': obj.product.title, 'cimage': obj.product.cimage}
        return ''

    class Meta:
        model = ProviderRequest
        fields = ('id', 'provider', 'size', 'varient', 'color',
                  'force_physical_barcode', 'quantity', 'morder', 'product')


class AdminProviderRequestrInfoSerializer(serializers.ModelSerializer):
    provider__str = serializers.CharField(source='provider.name', default='',)
    size__str = serializers.CharField(source='size.size', default='',)
    size__code = serializers.CharField(source='size.code', default='',)
    varient__str = serializers.CharField(source='varient.name', default='',)
    color__str = serializers.CharField(source='color.name', default='',)
    color__color = serializers.CharField(source='color.color', default='',)
    morder = serializers.SerializerMethodField()

    def get_morder(self, originalObj):
        obj = originalObj.orderItem.first()
        if obj:
            return obj.morder.first().id
        return ''

    class Meta:
        model = ProviderRequest
        fields = ('id', 'provider', 'force_physical_barcode', 'size', 'varient', 'color', 'provider__str',
                  'size__str', 'size__code', 'varient__str', 'color__str', 'color__color', 'quantity', 'morder')
        pass


class AdminProviderRequestrSerializer(serializers.ModelSerializer):
    provider__str = serializers.CharField(source='provider.name', default='',)
    size__str = serializers.CharField(source='size.size', default='',)
    size__code = serializers.CharField(source='size.code', default='',)
    varient__str = serializers.CharField(source='varient.name', default='',)
    color__str = serializers.CharField(source='color.name', default='',)
    color__color = serializers.CharField(source='color.color', default='',)

    class Meta:
        model = ProviderRequest
        fields = ('id', 'provider', 'force_physical_barcode', 'size', 'varient', 'color', 'provider__str',
                  'size__str', 'size__code', 'varient__str', 'color__str', 'color__color', 'quantity')
        pass


class AdminMOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.title')
    product_cimage = serializers.CharField(source='product.cimage')
    entries = AdminMOrderItemEntrySerializer(many=True, read_only=True)
    providers = serializers.SerializerMethodField('get_providers')
    pbarcode = serializers.CharField(source='product.barcode')
    colors = serializers.SerializerMethodField('get_colors')
    sizes = serializers.SerializerMethodField('get_sizes')
    verients = serializers.SerializerMethodField('get_verients')
    #available_inventory = serializers.SerializerMethodField('get_available_inventory')
    product = serializers.SerializerMethodField('get_product_serializer')
    toProviders = AdminProviderRequestrSerializer(many=True, read_only=True)

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
            'show_sizes_popup': product.show_sizes_popup,
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
        stock = WarehouseStock.objects.select_related('size', 'color', 'verient', 'ppn', 'product').values('size', 'color', 'verient', 'ppn__has_phisical_barcode', 'ppn__provider__name',) \
            .order_by('size', 'color', 'verient', 'ppn__has_phisical_barcode', 'ppn__provider__name',) \
            .filter(ppn__product=obj.product) \
            .annotate(total=Sum('quantity'))
        # get all the orders for this product frozen
        taken_in_other_orders = TakenInventory.objects.select_related('orderItem', 'size', 'color', 'varient', 'provider').filter(~Q(orderItem=obj), Q(orderItem__product__id=obj.product.id), Q(orderItem__morder__freezeTakenInventory=True), Q(orderItem__morder__archive=False)).annotate(total=Sum('quantity')).values('size', 'color', 'varient', 'has_physical_barcode', 'provider__name',) \
            .order_by('size', 'color', 'varient', 'has_physical_barcode', 'provider__name',) \
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
            s['taken'] = obj.taken.filter(has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'],
                                          color=s['color'], varient=s['verient']).aggregate(Sum('quantity'))['quantity__sum'] or 0
            s['total_with_freeze'] = s['total']
            frozen_inventory = taken_in_other_orders.filter(
                has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color'], varient=s['verient']).aggregate(Sum('quantity'))['quantity__sum'] or 0
            #toOrder          = taken.filter(barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'], size=s['size'], color=s['color'], varient=s['verient']).aggregate(Sum('toOrder'))
            s['frozen'] = frozen_inventory
            s['total'] = s['total'] - frozen_inventory
            #s['toOrder'] = TakenInventory.objects.select_related('product', 'size', 'color', 'varient', 'provider').filter(product=obj,color=s['color'],size=s['size'],varient=s['verient'],barcode=s['ppn__barcode'],has_physical_barcode=s['ppn__has_phisical_barcode'],provider__name=s['ppn__provider__name']).aggregate(Sum('toOrder'))['toOrder__sum'] or 0

            # taken=Subquery(obj.taken.filter(size=OuterRef('size'), color=OuterRef('color'), varient=OuterRef('verient'), barcode=OuterRef('ppn__barcode'), has_physical_barcode=OuterRef('ppn__has_phisical_barcode'), provider__name=OuterRef('ppn__provider__name'),output_field='quantity')))
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
        fields = ('id', 'product',  'price', 'providers', 'ergent', 'prining', 'embroidery', 'comment', 'product_name', 'entries', 'pbarcode',
                  'product_cimage', 'product', 'priningComment', 'embroideryComment', 'toProviders', 'colors', 'sizes', 'verients',)  # 'available_inventory',


class AdminMOrderListSerializer(serializers.ModelSerializer):
    client_businessName = serializers.CharField(
        source='client.businessName', read_only=False, default='')
    agent_name = serializers.CharField(
        source='agent.username', read_only=False, default='')
    total_price = serializers.SerializerMethodField('get_total_price')
    products_count = serializers.SerializerMethodField('get_products_count')

    def get_total_price(self, obj):
        return obj.prop_totalPrice

    def get_products_count(self, obj):
        return obj.products.count()

    class Meta:
        model = MOrder
        #order_by = ('created','id')
        fields = ('id', 'agent', 'agent_name', 'client', 'status', 'created', 'updated', 'message', 'name', 'phone', 'email', 'client_businessName',
                  'total_price', 'products_count', 'freezeTakenInventory', 'isOrder', 'sendProviders', 'startCollecting', 'archive',)


class AdminMOrderSerializer(serializers.ModelSerializer):
    products = AdminMOrderItemSerializer(many=True, read_only=True)
    client_businessName = serializers.CharField(
        source='client.businessName', read_only=False, default='')
    agent_name = serializers.CharField(
        source='agent.username', read_only=False, default='')
    #client_id = serializers.IntegerField(source='client.user.id', read_only=False)
    simulations = serializers.SerializerMethodField('get_simulations')

    def get_simulations(self, obj):
        ret = []
        try:
            sigModal = obj.mordersignature

            if sigModal:
                for sim in sigModal.simulations.all():
                    ret.append({
                        'id': sim.id,
                        'description': sim.description,
                        'cimage': sim.cimage,
                        'order': sim.order,
                    })
        except:
            pass
        return ret

    class Meta:
        model = MOrder
        fields = ('id', 'agent', 'agent_name', 'client', 'status', 'status2', 'status_msg', 'created', 'updated', 'message', 'name', 'phone',
                  'email', 'client_businessName', 'products', 'freezeTakenInventory', 'isOrder', 'sendProviders', 'startCollecting', 'simulations',)


class MOrderCollectionSerializer(serializers.ModelSerializer):
    client_businessName = serializers.CharField(
        source='client.businessName', read_only=False, default='')
    taken_count = serializers.SerializerMethodField('get_taken_count')
    collected_sum = serializers.SerializerMethodField('get_collected_sum')

    def get_taken_count(self, obj):
        return obj.products.all().prefetch_related('taken').aggregate(Sum('taken__quantity'))['taken__quantity__sum'] or 0

    def get_collected_sum(self, obj):
        qyt = 0
        qs = obj.products.all().prefetch_related('taken', 'taken__collected')
        for p in qs:
            for t in p.taken.all():
                for c in t.collected.all():
                    qyt += c.quantity
        return qyt

    class Meta:
        model = MOrder
        fields = ('id', 'name', 'created', 'updated', 'client', 'message',
                  'client_businessName', 'taken_count', 'collected_sum')


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
