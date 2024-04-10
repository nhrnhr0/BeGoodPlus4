
from rest_framework import serializers
from .models import Cart, CartItem, CartItemEntry
from productSize.models import ProductSizeGroup,ProductSize

class CartItemEntrySerializer(serializers.ModelSerializer):
    color = serializers.CharField(source='color.name')
    size = serializers.CharField(source='size.size')
    varient = serializers.CharField(source='varient.name', allow_null=True)
    
    class Meta:
        model = CartItemEntry
        fields = ('id', 'quantity', 'color_id', 'size_id', 'varient_id',
                    'color', 'size', 'varient')
        
class CartItemSerializer(serializers.ModelSerializer):
    entries = CartItemEntrySerializer(many=True)
    product__title = serializers.CharField(source='product.title')
    #distinct_color_count = serializers.SerializerMethodField('get_distinct_color_count')
    #distinct_varient_count = serializers.SerializerMethodField('get_distinct_varient_count')
    sizes_group_id = serializers.SerializerMethodField('get_sizes_group_id')
    distinct_colors = serializers.SerializerMethodField('get_distinct_colors')
    distinct_varients = serializers.SerializerMethodField('get_distinct_varients')
    
    def get_distinct_colors(self, obj):
        l = obj.entries.values('color__name').distinct()
        # return array of names
        return [color['color__name'] for color in l]

    def get_distinct_varients(self, obj):
        l = obj.entries.values('varient__name').distinct()
        # return array of names
        return [varient['varient__name'] for varient in l]
    
    # def get_distinct_color_count(self, obj):
    #     return obj.entries.values('color').distinct().count()
    # def get_distinct_varient_count(self, obj):
    #     return obj.entries.values('varient').distinct().count()
    def get_sizes_group_id(self, obj):
        # based on obj.entries.first().size.group.id
        return obj.entries.first().size.group.id
    
    class Meta:
        model = CartItem
        fields = ('id', 'product_id', 'product__title', 'sizes_group_id','distinct_colors','distinct_varients','entries',)


class CartSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField('get_products')
    def get_products(self, obj):
        products = obj.products.all()
        data = CartItemSerializer(products, many=True).data
        ret = {}
        for product in data:
            if not ret.get(product['sizes_group_id']):
                ret[product['sizes_group_id']] = []
            ret[product['sizes_group_id']].append(product)
        return ret
    
    class Meta:
        model = Cart
        fields = ('id', 'created', 'name', 'email', 'phone', 'privateCompany', 'message', 'is_inventory_check', 'is_order', 'is_price_proposal','products')



class SizesGroupSerializer(serializers.ModelSerializer):
    sizes = serializers.SerializerMethodField('get_sizes')
    def get_sizes(self, obj):
        sizes = obj.sizes.all()
        # return array of names (size.size)
        return [size.size for size in sizes]
    class Meta:
        model = ProductSizeGroup
        fields = ('id', 'name', 'sizes')