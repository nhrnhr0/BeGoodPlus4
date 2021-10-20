from rest_framework import serializers

from catalogImages.models import CatalogImage
from catalogAlbum.models import CatalogAlbum
from drf_multiple_model.views import ObjectMultipleModelAPIView
from django.urls import reverse

class SearchCatalogAlbumSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    my_type = serializers.ReadOnlyField(default='album')
    url = serializers.ReadOnlyField(default='/')
    class Meta:
        model = CatalogAlbum
        fields = ('id', 'url', 'title', 'slug', 'is_public', 'my_type',)
        #exclude = ('images',)

class SearchCatalogImageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    my_type = serializers.ReadOnlyField(default='product')
    url = serializers.ReadOnlyField(default='/')
    albums = SearchCatalogAlbumSerializer('albums', many=True)
    class Meta:
        model = CatalogImage
        #fields = '__all__'
        #exclude = ('colors','sizes')
        fields = ('id','url','title', 'albums','description', 'image','image_thumbnail', 'my_type',)
'''
from .models import BeseContactInformation
class UserTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = BeseContactInformation
        fields = ('name', 'phone', 'email', 'message', 'url', 'sumbited', 'created_date','formUUID' )
'''

'''
from drf_multiple_model.views import ObjectMultipleModelAPIView

class SearchSummarySerializer(ObjectMultipleModelAPIView):
    querylist = [
    #    {'queryset': Play.objects.all(), 'serializer_class': SearchCatalogAlbumSerializer},
    #    {'queryset': Poem.objects.filter(style='Sonnet'), 'serializer_class': PoemSerializer},
    ]
    def set_querylist(self, querylist):
        self.querylist = querylist
'''
'''
class SearchSummarySerializer(serializers.Serializer):
    """ Serializer that renders each instance with its own specific serializer """

    @classmethod
    def get_serializer(cls, model):
        if model == Model1:
            return CatalogImage
        elif model == Model2:
            return CatalogAlbum

    def to_representation(self, instance):
        serializer = self.get_serializer(instance.__class__)
        return serializer(instance, context=self.context).data

'''