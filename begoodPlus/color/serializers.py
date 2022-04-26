from rest_framework import serializers

from .models import Color
class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = '__all__'
        
        
class SvelteColorSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source='id')
    label = serializers.CharField(source='name')
    #color = serializers.CharField(source='color')
    class Meta:
        model = Color
        fields = ('value', 'label', 'color')
    pass