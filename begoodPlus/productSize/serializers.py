from django.db import models
from django.db.models import fields
from rest_framework import serializers

from .models import ProductSize
class ProductSizeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProductSize
        fields = '__all__'

class SvelteProductSizeSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='id')
    label = serializers.CharField(source='size')
    class Meta:
        model = ProductSize
        fields = ('value', 'label')