from rest_framework import serializers

from .models import UserTask,ProductsTask
class UserTaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserTask
        fields = '__all__'
        #exclude = ('images',)

from catalogImages.serializers import CatalogImageSerializer
class ProductsTaskSerializer(serializers.ModelSerializer):
    products_list = serializers.SerializerMethodField('_get_products')
    def _get_products(self, obj):
        serializer = CatalogImageSerializer(obj.products.prefetch_related('colors','sizes'),context=self.context, many=True,)
        return serializer.data
    class Meta:
        model = ProductsTask
        #fields = '__all__'
        exclude = ('products',)