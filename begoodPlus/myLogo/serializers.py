from rest_framework import serializers

from .models import MyLogoProduct, MyLogoCategory
class MyLogoCategorySearchSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    my_type = serializers.ReadOnlyField(default='mylogo_album')
    url = serializers.ReadOnlyField(default='/my-logo')
    class Meta:
        model = MyLogoCategory
        #fields = '__all__'
        fields = ('id', 'url', 'title', 'my_type',)
        #exclude = ('images',)



from rest_framework import serializers

from .models import MyLogoProduct
class MyLogoProductSearchSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.IntegerField(read_only=True)
    my_type = serializers.ReadOnlyField(default='mylogo_product')
    url2 = serializers.ReadOnlyField(default='/my-logo')
    album = MyLogoCategorySearchSerializer('album', many=True)
    class Meta:
        model = MyLogoProduct
        #fields = '__all__'
        #exclude = ('colors','sizes')
        fields = ('id','url', 'url2','title', 'album','description', 'img', 'my_type',)
