
from rest_framework import serializers

from catalogAlbum.models import CatalogAlbum
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmIntrestsGroups, MsCrmUser


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


class MsCrmUserWhatsappCampaignSerializer(serializers.ModelSerializer):
    lastMessageWithTimestamp = serializers.SerializerMethodField()
    businessTypeSelect = serializers.CharField(
        source='businessSelect.name', read_only=True)
    productfitAndList = serializers.SerializerMethodField()

    class Meta:
        model = MsCrmUser
        fields = ('id', 'name', 'phone', 'lastMessageWithTimestamp',
                  'businessTypeSelect', 'productfitAndList')

    def get_lastMessageWithTimestamp(self, obj):
        if obj.cached_whatsappMessagesSent is not None and len(obj.cached_whatsappMessagesSent) > 0:
            return '{} - {}'.format(obj.cached_whatsappMessagesSent[0].whatsapp_message.message, obj.cached_whatsappMessagesSent[0].created_at)
        else:
            return ''

    def get_productfitAndList(self, obj):
        intrestsQuerySet = obj.cached_intrests
        intrests = CatalogAlbumOnlyNameSerializer(
            intrestsQuerySet, many=True).data
        CatalogAlbums = self.context['catalogAlbums']
        percentage = int(len(intrests) / len(CatalogAlbums)
                         * 100) if len(CatalogAlbums) > 0 else 0
        return {
            "percentage": percentage,
            "list": intrests
        }


class MsCrmUsersForExcelSerializer(serializers.ModelSerializer):
    businessSelect = serializers.CharField(
        source="businessSelect.name", read_only=True)

    class Meta:
        model = MsCrmUser
        fields = ('phone', 'name', 'email',
                  'businessName', 'businessSelect')


class MsCrmPhoneContactsSerializer(serializers.ModelSerializer):
    clean_phonenumber = serializers.SerializerMethodField()

    def get_clean_phonenumber(self, obj):
        if len(obj.phone) == 0:
            return ''
        # remove \u2066 and ⁩ and '+'
        # then add one + at the begining and return
        phone = obj.phone
        phone = phone.replace('\u200f', '')
        phone = phone.replace('\u202a', '')
        phone = phone.replace('\u202c', '')
        phone = phone.replace('\u200f', '')
        phone = phone.replace('⁩', '')
        phone = phone.replace('⁦', '')
        phone = ''.join(e for e in phone if e.isalnum())
        if phone.startswith('0'):
            phone = '972' + phone[1:]
        if phone[0] != '+':
            phone = '+' + phone
        return phone

    class Meta:
        model = MsCrmUser
        fields = ('id', 'name', 'phone', 'clean_phonenumber')
