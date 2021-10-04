
from rest_framework import serializers
from .models import Provider

class SvelteProviderSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='id')
    label = serializers.CharField(source='name')
    class Meta:
        model = Provider
        fields = ('value', 'label')