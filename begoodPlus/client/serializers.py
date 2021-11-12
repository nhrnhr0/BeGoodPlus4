from .models import Client, UserLogEntry
from rest_framework import serializers

class SvelteClientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Client
        fields = ('user', 'name',)
    
    
class UserLogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLogEntry
        fields = '__all__'