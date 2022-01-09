from rest_framework import serializers
from rest_framework.utils import model_meta

from .models import CatalogImage
from color.serializers import ColorSerializer
from productSize.serializers import ProductSizeSerializer
from productColor.models import ProductColor
from productSize.models import ProductSize
from packingType.models import PackingType
from provider.models import Provider
import datetime

# I don't think this is used somewhere.
class CatalogImageApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogImage
        fields = ('id','date_modified','title', 'description', 'barcode',
                  'whatsapp_text', 'image', 'albums',
                  'packingTypeProvider', 'packingTypeClient',
                  'colors', 'sizes', 'providers', 'can_tag', 'detailTabel')
        extra_kwargs = {"image": {"required": False, "allow_null": True}}
        
    '''def to_internal_value(self, data):
        print('to_internal_value: ', data)

        data['packingTypeProvider'] = data['packingTypeProvider']
        data['packingTypeClient'] = data['packingTypeClient']
        i = 0
        colorsObjs = data['colors']
        data['colors'] = []
        for c in colorsObjs:
            data['colors'].append(c['value'])
            i+=1
        
        sizesObjs = data['sizes']
        data['sizes'] = []
        i=0
        for s in sizesObjs:
            data['sizes'].append(s['value'])
            i+=1
        
        providersObjs = data['providers']
        data['providers'] = []
        i=0
        for p in providersObjs:
            data['providers'].append(p['value'])
            i+=1
        data['image'] = self.instance.image
        data['barcode'] = ''
        data['image_thumbnail'] = self.instance.image
        ret = super().to_internal_value(data)
        return ret'''
        
    #def to_representation(self, instance):
        #print('to_representation: ', instance)
    #    return super().to_representation(instance)
    
class CatalogImageSerializer(serializers.HyperlinkedModelSerializer):
    colors_list = serializers.SerializerMethodField('_get_colors')
    id = serializers.IntegerField(read_only=True)
    def _get_colors(self, obj):
        serializer = ColorSerializer(obj.colors,context=self.context, many=True)
        return serializer.data
    sizes_list = serializers.SerializerMethodField('_get_sizes')
    def _get_sizes(self, obj):
        serializer = ProductSizeSerializer(obj.sizes,context=self.context, many=True)
        return serializer.data


    class Meta:
        model = CatalogImage
        #fields = '__all__'
        exclude = ('colors','sizes', 'packingTypeProvider','packingTypeClient', 'providers')