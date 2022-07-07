
from rest_framework import serializers

from catalogAlbum.models import CatalogAlbum
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmIntrestsGroups


class MsCrmIntrestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmIntrest
        fields = ('name',)


class MsCrmBusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmBusinessTypeSelect
        fields = ('id', 'name')


class CatalogAlbumOnlyNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogAlbum
        fields = ('title',)


class MsCrmIntrestsGroupsSerializer(serializers.ModelSerializer):
    intrests = CatalogAlbumOnlyNameSerializer(many=True)

    class Meta:
        model = MsCrmIntrestsGroups
        fields = ('name', 'intrests')
