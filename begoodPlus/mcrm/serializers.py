from rest_framework import serializers
from .models import CrmBusinessTypeSelect, CrmIntrest


class CrmIntrestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrmIntrest
        fields = ('name',)


class CrmBusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrmBusinessTypeSelect
        fields = ['id', 'name']
