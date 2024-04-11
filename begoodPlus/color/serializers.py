from rest_framework import serializers
from productColor.models import ProductColor
# from .models import Color
class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ('name', 'color', 'id')
        
        
# class SvelteColorSerializer(serializers.ModelSerializer):
#     value = serializers.CharField(source='id')
#     label = serializers.CharField(source='name')
#     #color = serializers.CharField(source='color')
#     class Meta:
#         model = Color
#         fields = ('value', 'label', 'color')
#     pass