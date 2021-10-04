from rest_framework import serializers

from .models import CatalogAlbum
from catalogImages.serializers import CatalogImageSerializer
from color.serializers import ColorSerializer
class CatalogAlbumSerializer(serializers.ModelSerializer):
    images_list = serializers.SerializerMethodField('_get_images')
    def _get_images(self, obj):
        serializer = CatalogImageSerializer(obj.images.order_by("throughimage__image_order").prefetch_related('colors','sizes'),context=self.context, many=True,)
        return serializer.data

    class Meta:
        model = CatalogAlbum
        #fields = '__all__'
        exclude = ('images',)