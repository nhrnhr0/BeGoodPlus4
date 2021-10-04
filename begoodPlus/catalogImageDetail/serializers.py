

from rest_framework import serializers
from .models import CatalogImageDetail

class CatalogImageDetailApiSerializer(serializers.ModelSerializer):
    #providerName = serializers.CharField(source='provider.name')
    
    class Meta:
        model = CatalogImageDetail
        fields = ('id','provider','colors','sizes','cost_price','client_price','recomended_price', 'parent')
