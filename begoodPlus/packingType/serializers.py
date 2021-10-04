
from django.db.models import fields
from rest_framework import serializers

from .models import PackingType
class PackingTypeSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source='name')
    value = serializers.CharField(source='id')
    class Meta:    
        model = PackingType
        fields = ('label','value')
        