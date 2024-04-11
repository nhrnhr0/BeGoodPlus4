from email.policy import default
from rest_framework import serializers

from .models import CatalogAlbum, TopLevelCategory
from catalogImages.serializers import CatalogImageSerializer
from color.serializers import ColorSerializer


class TopLevelCategorySerializer(serializers.ModelSerializer):
    sub_albums = serializers.SerializerMethodField('_get_sub_albuns')

    def _get_sub_albuns(self, obj):
        albums = obj.albums.filter(is_public=True).order_by(
            'album_order').values('id', 'title', 'slug', 'cimage', 'album_order',)
        return list(albums)

    class Meta:
        model = TopLevelCategory
        fields = ('id', 'name', 'get_image', 'albums',
                  'slug', 'my_order', 'sub_albums')
        ordering = ('my_order',)


class CatalogAlbumSerializer(serializers.ModelSerializer):
    images_list = serializers.SerializerMethodField('_get_images')

    def _get_images(self, obj):
        serializer = CatalogImageSerializer(obj.images.order_by(
            "throughimage__image_order").prefetch_related('colors', 'sizes'), context=self.context, many=True,)
        return serializer.data

    class Meta:
        model = CatalogAlbum
        #fields = '__all__'
        exclude = ('images',)


class CatalogAlbumSlimSerializer(serializers.ModelSerializer):
    topLevelCategory__slug = serializers.CharField(
        source='topLevelCategory.slug', default='')
    is_campain = serializers.SerializerMethodField('_is_campain')
    
    def _is_campain(self, obj):
        return False

    class Meta:
        model = CatalogAlbum
        fields = ('id', 'topLevelCategory', 'topLevelCategory__slug', 'title',
                  'slug', 'is_public', 'is_campain', 'cimage', 'album_order',)
