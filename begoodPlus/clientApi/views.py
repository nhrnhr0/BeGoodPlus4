from rest_framework.response import Response
from django.http.response import JsonResponse
from django.shortcuts import render
from clientApi.serializers import VarientSerializer
from catalogImages.models import CatalogImage
from client.views import get_user_info, whoAmI
from clientApi.serializers import ColorClientApi, ImageClientApi, SizeClientApi
from clientApi.serializers import AlbumClientApi, LogoClientApi
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from catalogAlbum.models import CatalogAlbum
from rest_framework.renderers import JSONRenderer
from catalogLogos.models import CatalogLogo
from core.views import get_session_key
from productColor.models import ProductColor
from productSize.models import ProductSize
class LogoClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogLogo.objects.all()
    serializer_class = LogoClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
# Create your views here.
class AlbumClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogAlbum.objects.all()
    serializer_class = AlbumClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
class ImageClientViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all().prefetch_related('colors','sizes','providers','varients')
    serializer_class = ImageClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get(self, request, *args, **kwargs):
        super(ImageClientViewSet, self).get(request, *args, **kwargs)
        return Response(self.serializer_class(self.queryset, many=True, context={
            'request':request,
            }).data)


class ColorsClientViewSet(viewsets.ModelViewSet):
    queryset = ProductColor.objects.all()
    serializer_class = ColorClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]

class SizesClientViewSet(viewsets.ModelViewSet):
    queryset = ProductSize.objects.all()
    serializer_class = SizeClientApi
    permission_classes = [IsAuthenticatedOrReadOnly]
    
from rest_framework.decorators import api_view, authentication_classes, permission_classes, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from django.views.decorators.cache import cache_page
import functools
from django.db import connection


@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def get_products_info(request):
    ids = request.GET.get('product_ids').split(',')
    print(ids)
    images = CatalogImage.objects.filter(id__in=ids)
    images = images.prefetch_related('colors','sizes','albums','varients').select_related('packingTypeClient')
    ser = ImageClientApi(images, many=True,context={
        'request': request
    })
    return Response(ser.data)

@api_view(['GET'])
@renderer_classes((JSONRenderer,))
def get_products_info2(request):
    ids = request.GET.getlist('pid[]')
    images = CatalogImage.objects.filter(id__in=ids)
    images = images.prefetch_related('colors','sizes','albums','varients').select_related('packingTypeClient')
    ser = ImageClientApi(images, many=True,context={
        'request': request
    })
    return Response(ser.data)
@api_view(('GET',))
@renderer_classes((JSONRenderer,))
def get_album_images(request, pk):
    album = CatalogAlbum.objects.get(id=pk)
    ser = images_from_album_serializer(album,request)
    data = ser.data
    #print(connection.queries)
    #print(len(connection.queries))
    
    return Response(data)

def images_from_album_serializer(album,request):
    images = album.images.filter(is_active=True).order_by('throughimage__image_order')
    images = images.prefetch_related('colors','sizes','albums','varients').select_related('packingTypeClient')
    ser = ImageClientApi(images, many=True,context={
        'request': request
    })
    return ser

from catalogImages.models import CatalogImageVarient
def get_all_sizes_api(request):
    sizes = SizeClientApi(ProductSize.objects.all(), many=True).data
    return JsonResponse(sizes, safe=False)
def get_all_colors_api(request):
    colors = ColorClientApi(ProductColor.objects.all(), many=True).data
    return JsonResponse(colors, safe=False)
def get_all_varients_api(request):
    varients = VarientSerializer(CatalogImageVarient.objects.all(), many=True).data
    return JsonResponse(varients, safe=False)
import time
import random
@permission_classes((AllowAny,))
@api_view(('GET',))
def main_page_api(request):
    '''
        colors: colors_ret,
        sizes: sizes_ret,
        albums: albums_json,
        logos: logos_json,
        all_products: products
    '''
    all_albums_qs = CatalogAlbum.objects.filter(is_public=True)#.prefetch_related('images')
    albums = AlbumClientApi(all_albums_qs, many=True).data
    sizes = SizeClientApi(ProductSize.objects.all(), many=True).data
    colors = ColorClientApi(ProductColor.objects.all(), many=True).data
    logos = LogoClientApi(CatalogLogo.objects.all(), many=True).data
    # all_products[album_id] = get_album_images
    #for album in all_albums_qs:
    #    all_products_data[album.id] = images_from_album_serializer(album).data
    
    ret = {
        'colors': colors,
        'sizes': sizes,
        'logos': logos,
        'albums': albums,
    }
    return JsonResponse(ret, safe=False)
    #logos = CatalogLogo.objects.all()
    
    
    
    


from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import login

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        login(request, user)
        response = super(CustomAuthToken, self).post(request, format=None)
        who_am_i = get_user_info(request.user)
        token, created = Token.objects.get_or_create(user=user)
        response.set_cookie(
            'auth_token',
            token.key,
            httponly=True,
            samesite='strict'
        )
        # add whoAmI to the response
        response.data['me'] = who_am_i
        print('CustomAuthToken:', response.data)
        return response

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse