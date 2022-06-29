
from rest_framework import serializers

from catalogAlbum.models import CatalogAlbum
from .models import  MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmIntrestsGroups, MsCrmUser


class MsCrmIntrestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmIntrest
        fields = ('name',)
        
class MsCrmBusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MsCrmBusinessTypeSelect
        fields = ('name',)
class CatalogAlbumOnlyNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogAlbum
        fields = ('title',)
class MsCrmIntrestsGroupsSerializer(serializers.ModelSerializer):
    intrests = CatalogAlbumOnlyNameSerializer(many=True)
    class Meta:
        model = MsCrmIntrestsGroups
        fields = ('name', 'intrests')
        
class MsCrmPhoneContactsSerializer(serializers.ModelSerializer):
    clean_phonenumber = serializers.SerializerMethodField()
    
    def get_clean_phonenumber(self, obj):
        # remove \u2066 and ⁩ and '+'
        # then add one + at the begining and return
        phone = obj.phone
        phone = phone.replace('\u200f', '')
        phone = phone.replace('\u202a', '')
        phone = phone.replace('\u202c', '')
        phone = phone.replace('\u200f', '')
        if phone.startswith('05'):
            phone = '+972' + phone
        if phone[0] != '+':
            phone = '+' + phone
        return phone
    class Meta:
        model = MsCrmUser
        fields = ('id', 'name', 'phone', 'clean_phonenumber')
        