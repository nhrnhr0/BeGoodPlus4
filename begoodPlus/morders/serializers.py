

from rest_framework import serializers
from .models import MOrder
class AdminMOrderSerializer(serializers.ModelSerializer):
    products = serializers.Serializer()
    class Meta:
        model = MOrder
        fields = ('id', 'client', 'status', 'created', 'updated','message','name', 'phone', 'email')
        