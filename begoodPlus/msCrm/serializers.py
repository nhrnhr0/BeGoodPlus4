
from rest_framework import serializers
from .models import  MsCrmBusinessTypeSelect, MsCrmIntrest


class MsCrmIntrestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmIntrest
        fields = ('name',)
        
class MsCrmBusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmBusinessTypeSelect
        fields = ('name',)