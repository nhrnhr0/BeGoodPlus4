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
        
class AdminClientSerializer(serializers.Serializer):
    class Meta:
        model = Client
        fields = ('id', 'user', 'name',)