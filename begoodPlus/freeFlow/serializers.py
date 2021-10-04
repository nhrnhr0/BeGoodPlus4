from rest_framework import serializers

from .models import FreeFlowStores

class FreeFlowStoresSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = FreeFlowStores
        fields = '__all__'