from rest_framework import serializers

from .models import CatalogAlbum, TopLevelCategory
from catalogImages.serializers import CatalogImageSerializer
from color.serializers import ColorSerializer

class TopLevelCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TopLevelCategory
        fields = ('id', 'name', 'get_image','albums','slug','my_order',)
        ordering = ('my_order',)



class CatalogAlbumSerializer(serializers.ModelSerializer):
    images_list = serializers.SerializerMethodField('_get_images')
    def _get_images(self, obj):
        serializer = CatalogImageSerializer(obj.images.order_by("throughimage__image_order").prefetch_related('colors','sizes'),context=self.context, many=True,)
        return serializer.data

    class Meta:
        model = CatalogAlbum
        #fields = '__all__'
        exclude = ('images',)
    
class CatalogAlbumSlimSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CatalogAlbum
        fields = ('id','topLevelCategory','title','slug','is_public','is_campain','cimage','album_order',)