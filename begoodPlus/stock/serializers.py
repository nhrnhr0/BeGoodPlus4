from rest_framework import serializers

from .models import Stock

class stockSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Stock
        fields = ('id', 'product', 'amount')