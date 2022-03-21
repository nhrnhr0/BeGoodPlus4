
from .models import PPN, DocStockEnter, ProductEnterItems, SKUM, Warehouse
from rest_framework import serializers
class PPNSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source='product.id')
    product_name = serializers.CharField(source='product.title')
    provider_id = serializers.CharField(source='provider.id')
    provider_name = serializers.CharField(source='provider.name')
    
    class Meta:
        model = PPN
        fields = ('id', 'provider_id', 'provider_name', 'product_id', 'product_name', 'providerProductName')

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

class ProductEnterItemsSerializer(serializers.ModelSerializer):
    #sku = SKUMSerializer(many=False)
    sku_id = serializers.CharField(source='sku.id')
    sku_size_id = serializers.CharField(source='sku.size.id')
    sku_size_name = serializers.CharField(source='sku.size.size')
    sku_color_id = serializers.CharField(source='sku.color.id')
    sku_color_name = serializers.CharField(source='sku.color.name')
    sku_verient_id = serializers.CharField(source='sku.verient.id', default='')
    sku_verient_name = serializers.CharField(source='sku.verient.name', default='')
    sku_ppn_id = serializers.CharField(source='sku.ppn.id')
    sku_ppn_name = serializers.CharField(source='sku.ppn.providerProductName')
    sku_ppn_provider_id = serializers.CharField(source='sku.ppn.provider.id')
    sku_ppn_provider_name = serializers.CharField(source='sku.ppn.provider.name')
    sku_product_id = serializers.CharField(source='sku.ppn.product.id')
    sku_product_name = serializers.CharField(source='sku.ppn.product.title')
    class Meta:
        model = ProductEnterItems
        #fields = ('id', 'sku','quantity','price','created_at',)
        fields = ('id', 'quantity','price','created_at', 'sku_id', 'sku_size_id', 'sku_size_name', 'sku_color_id', 'sku_color_name', 'sku_verient_id', 'sku_verient_name', 'sku_ppn_id', 'sku_ppn_name', 'sku_product_id', 'sku_product_name','sku_ppn_provider_id','sku_ppn_provider_name')

class DocStockEnterSerializer(serializers.ModelSerializer):
    items = ProductEnterItemsSerializer(many=True)
    provider_name = serializers.CharField(source='provider.name')
    warehouse_name = serializers.CharField(source='warehouse.name')
    class Meta:
        model = DocStockEnter
        fields = ('id','docNumber', 'description','created_at','provider', 'provider_name', 'warehouse','warehouse_name','items','isAplied','byUser',)