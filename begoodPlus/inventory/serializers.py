
from clientApi.serializers import ImageClientApi
from .models import PPN, DocStockEnter, ProductEnterItems, SKUM, ProductEnterItemsEntries, ProviderRequest, ProviderRequestToEnter, Warehouse, WarehouseStock, WarehouseStockHistory
from rest_framework import serializers


class WarehouseStockSerializer(serializers.ModelSerializer):
    product_name= serializers.CharField(source='ppn.product.title')
    product_image = serializers.CharField(source='ppn.product.cimage')
    product_id=  serializers.CharField(source='ppn.product.id')
    size_name=  serializers.CharField(source='size.size')
    color_name=  serializers.CharField(source='color.name')
    verient_name=  serializers.CharField(source='verient.name', default='')
    warehouse_name= serializers.CharField(source='warehouse.name') 
    provider_name = serializers.CharField(source='ppn.provider.name')
    provider_id = serializers.CharField(source='ppn.provider.id')
    barcode = serializers.CharField(source='ppn.barcode')
    has_phisical_barcode = serializers.BooleanField(source='ppn.has_phisical_barcode')
    class Meta:
        model = WarehouseStock
        fields = ('id', 'created_at','updated_at','warehouse','warehouse_name', 'ppn','size','color','verient','quantity','created_at','updated_at','avgPrice','product_name','product_image','product_id','size_name','color_name','verient_name','provider_id', 'provider_name','barcode', 'has_phisical_barcode',)

class PPNSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.id')
    product_name = serializers.CharField(source='product.title')
    product_image = serializers.CharField(source='product.cimage')
    provider_id = serializers.CharField(source='provider.id')
    provider_name = serializers.CharField(source='provider.name')
    product = ImageClientApi(read_only=True, many=False)
    
    class Meta:
        model = PPN
        fields = ('id','product', 'provider_id', 'provider_name', 'product_id', 'product_name', 'providerProductName','barcode','buy_price','product_image', 'has_phisical_barcode',)

class SKUMSerializer(serializers.ModelSerializer):
    size_name = serializers.CharField(source='size.size')
    color_name = serializers.CharField(source='color.name')
    verient_name = serializers.CharField(source='verient.name', default='')
    ppn_name = serializers.CharField(source='ppn.providerProductName')
    product_name = serializers.CharField(source='ppn.product.title')
    product_id = serializers.CharField(source='ppn.product.id')
    class Meta:
        model = SKUM
        fields = ('id', 'ppn', 'ppn_name','size', 'size_name','color', 'color_name','verient', 'verient_name', 'created_at','product_name', 'product_id')

class ProductEnterItemsEntriesSerializer(serializers.ModelSerializer):
    size_name = serializers.CharField(source='size.size')
    color_name = serializers.CharField(source='color.name')
    verient_name = serializers.CharField(source='verient.name', default='')
    class Meta:
        model = ProductEnterItemsEntries
        fields = ('id', 'size', 'size_name','color', 'color_name','verient', 'verient_name','quantity','created_at')


# class ProviderSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProviderEnterItems
#         fields = ('id', 'quantity')#, 'providerRequest', 'providerEnterItems') 


class ProviderRequestToEnterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderRequestToEnter
        fields = ('id','providerRequest', 'quantity')#, 'providerRequest', 'providerEnterItems')
class ProductEnterItemsSerializer(serializers.ModelSerializer):
    ##sku = SKUMSerializer(many=False)
    #sku_id = serializers.CharField(source='sku.id')
    #sku_size_id = serializers.CharField(source='sku.size.id')
    #sku_size_name = serializers.CharField(source='sku.size.size')
    #sku_color_id = serializers.CharField(source='sku.color.id')
    #sku_color_name = serializers.CharField(source='sku.color.name')
    #sku_verient_id = serializers.CharField(source='sku.verient.id', default='')
    #sku_verient_name = serializers.CharField(source='sku.verient.name', default='')
    #sku_ppn_id = serializers.CharField(source='sku.ppn.id')
    #sku_ppn_name = serializers.CharField(source='sku.ppn.providerProductName')
    #sku_ppn_provider_id = serializers.CharField(source='sku.ppn.provider.id')
    #sku_ppn_provider_name = serializers.CharField(source='sku.ppn.provider.name')
    #sku_product_id = serializers.CharField(source='sku.ppn.product.id')
    #sku_product_name = serializers.CharField(source='sku.ppn.product.title')
    #sku_product_image = serializers.CharField(source='sku.ppn.product.cimage')
    # ppn_product_cimage = serializers.CharField(source='ppn.product.cimage')
    # ppn_product_title = serializers.CharField(source='ppn.product.title')
    # ppn_provider_id = serializers.CharField(source='ppn.provider.id')
    # ppn_provider_name = serializers.CharField(source='ppn.provider.name')
    # ppn_providerProductName = serializers.CharField(source='ppn.providerProductName')
    ppn = PPNSerializer(many=False)
    entries = ProductEnterItemsEntriesSerializer(many=True)
    providerRequests = ProviderRequestToEnterSerializer(many=True)
    #freeProviders = serializers.SerializerMethodField()
    
    # def get_freeProviders(self, obj):
    #     product_id = obj.ppn.product.id
    #     provider_id = obj.ppn.provider.id
    #     freeProviders = ProviderRequest.objects.filter(orderItem__product__id=product_id, provider__id=provider_id)
    #     # get the values 'id','provider','size','varient','color','force_physical_barcode','quantity', morder.first().id
    #     vals = freeProviders.values('id','provider','size','varient','color','force_physical_barcode','quantity', 'orderItem__morder__id')
    #     return list(vals)
    #providers = ProviderSerializer(many=True)
    class Meta:
        model = ProductEnterItems
        #fields = ('id', 'sku','quantity','price','created_at',)
        fields = ('id','ppn', 'total_quantity','price','created_at','entries','providerRequests',)

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ('id','name',)


class DocStockEnterListSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    username = serializers.CharField(source='byUser.username', default='')
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider', 'provider_name', 'warehouse','warehouse_name','isAplied','byUser','username')

class DocStockEnterSerializer(serializers.ModelSerializer):
    items = ProductEnterItemsSerializer(many=True)
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    freeProviders = serializers.SerializerMethodField()
    
    def get_freeProviders(self, obj):
        products_ids = [item.ppn.product.id for item in obj.items.all()]
        providers_ids = [item.ppn.provider.id for item in obj.items.all()]
        # product_id = obj.items.first().ppn.product.id
        # provider_id = obj.items.first().ppn.provider.id
        freeProviders = ProviderRequest.objects.filter(orderItem__product__id__in=products_ids, provider__id__in=providers_ids)
        # get the values 'id','provider','size','varient','color','force_physical_barcode','quantity', morder.first().id
        vals = freeProviders.values('id','provider','size','varient','color','force_physical_barcode','quantity', 'orderItem__morder__id', 'orderItem__product__id', 'orderItem__product__title')
        return list(vals)
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider', 'provider_name', 'warehouse','warehouse_name','freeProviders', 'items','isAplied','byUser','new_products')
        
class DocStockEnterSerializerList(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    username = serializers.CharField(source='byUser.username', default='None')
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider_name', 'warehouse_name','isAplied','byUser')
        
class WarehouseStockHistorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = WarehouseStockHistory
        fields = ('id','created_at','note','user','old_quantity','new_quantity','created_at','note','user',)