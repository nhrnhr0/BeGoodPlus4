from .models import Client
from rest_framework import serializers

class SvelteClientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Client
        fields = ('user', 'name',)
        