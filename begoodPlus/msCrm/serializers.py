
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
        whatsappMessageSent = obj.whatsappMessagesSent.order_by(
            '-created_at').first()
        if whatsappMessageSent is not None:
            return '{} - {}'.format(obj.whatsappMessageSent.whatsapp_message.message, obj.whatsappMessageSent.created_at)
        else:
            return ''

    def get_productfitAndList(self, obj):
        return ''


class MsCrmUsersForExcelSerializer(serializers.ModelSerializer):
    businessSelect = serializers.CharField(
        source="businessSelect.name", read_only=True)

    class Meta:
        model = MsCrmUser
        fields = ('phone', 'name', 'email',
                  'businessName', 'businessSelect')
