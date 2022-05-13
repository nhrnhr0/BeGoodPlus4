
from clientApi.serializers import ImageClientApi
from .models import PPN, DocStockEnter, ProductEnterItems, SKUM, ProductEnterItemsEntries, Warehouse
from rest_framework import serializers
class PPNSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.id')
    product_name = serializers.CharField(source='product.title')
    product_image = serializers.CharField(source='product.cimage')
    provider_id = serializers.CharField(source='provider.id')
    provider_name = serializers.CharField(source='provider.name')
    product = ImageClientApi(read_only=True, many=False)
    class Meta:
        model = PPN
        fields = ('id','product', 'provider_id', 'provider_name', 'product_id', 'product_name', 'providerProductName','barcode','buy_price','product_image', 'default_warehouse')

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
    class Meta:
        model = ProductEnterItems
        #fields = ('id', 'sku','quantity','price','created_at',)
        fields = ('id','ppn', 'total_quantity','price','created_at','entries','warehouse','barcode',)

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ('id','name',)

class DocStockEnterSerializer(serializers.ModelSerializer):
    items = ProductEnterItemsSerializer(many=True)
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider', 'provider_name', 'warehouse','warehouse_name','items','isAplied','byUser','new_products')
        
class DocStockEnterSerializerList(serializers.ModelSerializer):
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    username = serializers.CharField(source='byUser.username', default='None')
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider_name', 'warehouse_name','isAplied','byUser')