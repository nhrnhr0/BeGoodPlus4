from provider.models import Provider
from django.db import models
from rest_framework import serializers

from stock.models import Stock
from product.models import Product
from productSize.models import ProductSize
from productColor.models import ProductColor
class  StoreProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name')
    pass


class  StoreProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = ('id', 'name')
    pass

class  StoreProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ('__all__')
    pass

class  StoreProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ('__all__')
    pass


class StoreStockSerializer(serializers.ModelSerializer):
    #product = serializers.StringRelatedField(many=False)
    product = StoreProductSerializer(many=False)
    provider = StoreProviderSerializer(many=False)
    productSize = StoreProductSizeSerializer(many=False)
    productColor = StoreProductColorSerializer(many=False)
    class Meta:
        model = Stock
        fields = ('id', 'product', 'provider','productSize','productColor', 'amount', '__str__')



from .models import Stores, Inventory, InventoryEntry
class StoresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stores
        fields = '__all__'




class InventoryEntrySerializer(serializers.ModelSerializer):

    stock = StoreStockSerializer(many=False, read_only=True)
    serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='title'
     )
    class Meta:
        model = InventoryEntry
        fields = ('id', 'amount','stock',)

class InventorySerializer(serializers.ModelSerializer):
    entries = InventoryEntrySerializer(many=True, read_only=True)
    class Meta:
        model = Inventory
        fields = ('id', 'owner','date', 'entries',)

