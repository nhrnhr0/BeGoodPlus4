from rest_framework.pagination import PageNumberPagination
from django.db.models.query import QuerySet
import time
from rest_framework.views import APIView
from datetime import datetime
from rest_framework import serializers
from email.policy import default
from django.http import HttpRequest
from django.http.response import JsonResponse
from django.shortcuts import redirect, render
import pytz
from catalogAlbum.models import TopLevelCategory
from campains.models import CampainProduct, MonthCampain
from campains.views import get_user_active_campaigns, get_user_campains_serializer_data
import catalogAlbum
from catalogAlbum.models import CatalogAlbum, ThroughImage
from client.models import Client
from clientApi.serializers import ImageClientApi

from core.models import SvelteCartProductEntery
from core.pagination import CurserResultsSetPagination, StandardResultsSetPagination
from inventory.models import PPN
from productColor.models import ProductColor
from productSize.models import ProductSize
from .models import CatalogImage
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import CatalogImageIdSerializer, CatalogImageSerializer, CatalogImageApiSerializer
from rest_framework.request import Request
from catalogImageDetail.models import CatalogImageDetail
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import json
from django.contrib import messages
from django.urls import reverse
import decimal
import pandas as pd
from django.db.models import Q
from provider.models import Provider


def create_image_from_exel(request):
    context = {}
    if(request.method == "POST"):
        products = []
        productNameCol = request.POST['product_name']
        productPriceCol = request.POST['product_price']
        file = request.FILES['file']
        df = pd.read_excel(file)
        df = df.fillna('')
        for index, row in df.iterrows():
            productName = row[productNameCol]
            productPrice = row[productPriceCol]
            obj = CatalogImage.objects.filter(title=productName)
            obj = obj.first()
            if(obj is not None):
                products.append(
                    {'title': obj.title, 'price': productPrice, 'id': obj.id, 'cimage': obj.cimage})
        context['products'] = products
        return render(request, 'catalogImages/create_image_from_exel_result.html', context=context)
    return render(request, 'catalogImages/create_image_from_exel.html', context=context)


class SearchProductSerializer(serializers.ModelSerializer):
    public_album_slug = serializers.SerializerMethodField()
    public_album_id = serializers.SerializerMethodField()
    public_album_top_slug = serializers.SerializerMethodField()

    def get_public_album_slug(self, obj):
        obj = obj.albums.filter(is_public=True).first()
        if obj:
            return obj.slug
        else:
            return ''

    def get_public_album_id(self, obj):
        obj = obj.albums.filter(is_public=True).first()
        if obj:
            return obj.id
        else:
            return ''

    def get_public_album_top_slug(self, obj):
        obj = obj.albums.filter(is_public=True).first()
        if obj and obj.topLevelCategory:
            return obj.topLevelCategory.slug
        else:
            return ''

    class Meta:
        model = CatalogImage
        fields = ('id', 'title', 'cimage', 'public_album_slug',
                  'public_album_id', 'albums', 'public_album_top_slug')


class SlimCatalogImageSerializer(serializers.ModelSerializer):
    main_public_album_top__slug = serializers.CharField(
        source='main_public_album.topLevelCategory.slug', default=None)
    main_public_album__slug = serializers.CharField(
        source='main_public_album.slug', default=None)

    class Meta:
        model = CatalogImage
        fields = ('id', 'title', 'cimage', 'price', 'new_price',
                  'main_public_album__slug', 'main_public_album_top__slug', 'link', 'out_of_stock')
    #main_album = serializers.SerializerMethodField('_get_main_album')
    new_price = serializers.SerializerMethodField('_get_new_price')
    price = serializers.SerializerMethodField('_get_price')
    link = serializers.SerializerMethodField('_get_link')
    out_of_stock = serializers.SerializerMethodField('_get_out_of_stock')

    def _get_out_of_stock(self, obj):
        return obj.out_of_stock

    def _get_link(self, obj):
        return '/main?' + 'top=' + obj.main_public_album.topLevelCategory.slug + '&album=' + obj.main_public_album.slug + '&product_id=' + str(obj.id)

    def get_user_id(self):
        request = self.context.get('request', None)
        ret_user_id = None
        if request:
            if request.user.is_authenticated and request.user.client:
                if request.user.client:
                    if request.user.is_superuser and request.COOKIES.get('actAs'):
                        ret_user_id = request.COOKIES.get('actAs')
                    else:
                        ret_user_id = request.user.id
        return ret_user_id

    def __init__(self, instance=None, data=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.user_id = self.get_user_id()
        if self.user_id:
            self.client = Client.objects.get(user_id=self.user_id)
            self.tariff = self.client.tariff
        else:
            self.tariff = 0
            self.client = None
        #print('====> self.user_id', self.client, 'tariff', self.tariff)
        # find user active campains with the products
        tz = pytz.timezone('Israel')
        try:
            catalogImage_ids = [i.id for i in instance] if instance else []
        except:
            if instance:
                catalogImage_ids = [instance.id]
            else:
                catalogImage_ids = []
        # campainProduct = CampainProduct.objects.filter(monthCampain__users__user_id=user_id, catalogImage_id=catalogImage_id,monthCampain__is_shown=True,monthCampain__startTime__lte=datetime.now(tz),monthCampain__endTime__gte=datetime.now(tz)).first()
        campainProducts = CampainProduct.objects.filter(monthCampain__users__user_id=self.user_id, catalogImage_id__in=catalogImage_ids,
                                                        monthCampain__is_shown=True, monthCampain__startTime__lte=datetime.now(tz), monthCampain__endTime__gte=datetime.now(tz))

        # create dict if catalogImage_id as key and newPrice as value
        self.campainProducts_dict = {}
        for campainProduct in campainProducts:
            self.campainProducts_dict[campainProduct.catalogImage_id] = campainProduct.newPrice
        #print('done serializer init')

    def _get_new_price(self, obj):
        if obj.id in self.campainProducts_dict:
            return self.campainProducts_dict[obj.id]
        else:
            return None

    # def _get_main_album(self, obj):
    #     alb = obj.albums.filter(is_public=True).first()
    #     if alb:
    #         return alb.id
    #     return None
    def _get_price(self, obj):
        if self.client:
            price = obj.client_price + (obj.client_price * (self.tariff/100))
            price = round(price * 2) / \
                2 if price > 50 else "{:.2f}".format(price)
            return float(decimal.Decimal(price).normalize())
        else:
            return 0


class SlimThroughImageSerializer(serializers.ModelSerializer):

    def __init__(self, instance=None, data=..., **kwargs):
        super().__init__(instance, data, **kwargs)

    catalogImage = serializers.SerializerMethodField(
        'getSlimCatalogImageSerializer')

    def getSlimCatalogImageSerializer(self, obj):
        ob = CatalogImage.objects.get(id=obj.catalogImage_id)
        ret = SlimCatalogImageSerializer(
            instance=obj.catalogImage, context=self.context)
        data = ret.data
        return data
    catalogAlbum__title = serializers.SerializerMethodField(
        '_get_catalogAlbum_title')

    def _get_catalogAlbum_title(self, obj):
        return obj.catalogAlbum.title

    class Meta:
        model = ThroughImage
        fields = ('catalogImage', 'catalogAlbum',
                  'image_order', 'catalogAlbum__title')


class FakeTop:
    def __init__(self, id, name, slug, is_public):
        self.id = id
        self.name = name
        self.slug = slug
        self.is_public = is_public


def get_main_info(request):
    album_slug = request.GET.get('album')
    top_album_slug = request.GET.get('top', None)
    top_album = None
    product_id = request.GET.get('product_id', None)
    if top_album_slug:
        if(top_album_slug == 'new'):
            top_album = FakeTop(0, 'חדשים', 'new', True)
            top_albums = list(CatalogAlbum.objects.filter(is_public=True).order_by(
                'album_order').values('id', 'title', 'cimage', 'is_public', 'slug',))
        elif(top_album_slug == 'campaigns'):
            # top_album = class with id, title, slug, cimage, is_public
            top_album = FakeTop(0, 'מבצעים', 'campaigns', True)

            campains = get_user_active_campaigns(request.user)
            if campains:
                top_albums = [{
                    'id': c.album.id,
                    'title': c.album.title,
                    'slug': c.album.slug,
                    'cimage': c.album.cimage,
                    'is_public': c.album.is_public,
                } for c in campains]
            else:
                top_albums = []
            #top_albums = list(top_albums.values('id','title', 'cimage', 'is_public', 'slug',))
        else:
            top_album = TopLevelCategory.objects.get(slug=top_album_slug)
            top_albums = list(CatalogAlbum.objects.filter(topLevelCategory=top_album, is_public=True).order_by(
                'album_order').values('id', 'title', 'cimage', 'is_public', 'slug',))
    else:
        # list(CatalogAlbum.objects.filter(is_public=True).order_by('album_order').values('id','title', 'cimage', 'is_public', 'slug',))
        top_albums = []

    productInfo = None
    if product_id:
        product = CatalogImage.objects.get(id=product_id)
        #productObj = product.select_related('packingTypeClient')
        productSer = ImageClientApi(product, many=False, context={
            'request': request
        })
        productInfo = productSer.data
    ret = {
        'album_id': top_album_slug,
        'top': top_album.slug if top_album else '',
        'query_string': request.GET.urlencode(),
        'top_albums': top_albums
    }
    # create og meta to retrun, can be product_id or album_id or top_album by this priority order
    if product_id:
        ret['og_meta'] = get_product_og_meta(product_id)
        ret['productInfo'] = productInfo
    elif album_slug:
        album = CatalogAlbum.objects.get(slug=album_slug)
        ret['og_meta'] = get_album_og_meta(album)
    elif top_album:
        icon = None
        if(top_album_slug == 'campaigns'):
            icon = 'https://res.cloudinary.com/ms-global/image/upload/v1660132407/msAssets/Group_10_copy_10_3_-removebg-preview_1_uq2t66.png'
        elif (top_album_slug == 'new'):
            icon = 'https://res.cloudinary.com/ms-global/image/upload/v1660122508/msAssets/icons8-new-product-64_gikxga.png'
        ret['og_meta'] = get_top_album_og_meta(top_album, icon)
    else:
        ret['og_meta'] = {}

    return JsonResponse(ret)


def get_product_og_meta(product_id):
    product = CatalogImage.objects.get(id=product_id)
    cimage = product.cimage if product.cimage else 'undefined'
    #
    return {
        'icon': 'https://res.cloudinary.com/ms-global/image/upload/c_scale,w_219,h_219/c_scale,u_v1649744644:msAssets:image_5_qo7yhx.jpg,w_300/' + cimage,
        'title': product.title,
        'description': product.description[:175] + '...',
    }


def get_album_og_meta(album):
    album_cimage = album.cimage if album.cimage else 'undefined'
    return {
        'icon': 'https://res.cloudinary.com/ms-global/image/upload/c_scale,w_219,h_219/c_scale,u_v1649744644:msAssets:image_5_qo7yhx.jpg,w_300/' + album_cimage,
        'title': album.title,
        'description': album.description[:175] + '...',
        'keywords': album.keywords,
    }


def get_top_album_og_meta(top_album, icon=None):
    if not icon:
        if not top_album.image:
            first_album = CatalogAlbum.objects.filter(
                Q(topLevelCategory__id=top_album.id) & ~Q(cimage='')).first()
            if first_album:
                icon = 'https://res.cloudinary.com/ms-global/image/upload/c_scale,w_219,h_219/c_scale,u_v1649744644:msAssets:image_5_qo7yhx.jpg,w_300/' + first_album.cimage
            else:
                icon = ''
        else:
            icon = 'https://res.cloudinary.com/ms-global/image/upload/c_scale,w_219,h_219/c_scale,u_v1649744644:msAssets:image_5_qo7yhx.jpg,w_300/' + top_album.image.public_id
    return {
        'icon': icon,
        'title': top_album.name,
    }


def get_products_slim(request):
    product_ids = request.GET.getlist('pid[]')
    if product_ids:
        catalogImage = CatalogImage.objects.filter(id__in=product_ids)
        catalogImage_serializer = SlimCatalogImageSerializer(
            catalogImage, many=True, context={'request': request})
        #print('catalogImage_serializer.is_valid', catalogImage_serializer.is_valid())
        # print(catalogImage_serializer.errors)
        data = catalogImage_serializer.data
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'no product_ids provided'})


@api_view(['GET'])
def get_similar_products(request, product_id):
    product = CatalogImage.objects.get(id=product_id)
    similar_products = CatalogImage.objects.filter(Q(albums__id__in=product.albums.all(
    )) & ~Q(id=product.id) & Q(is_active=True)).order_by('?')[:35]
    similar_products = similar_products.select_related(
        'main_public_album', 'main_public_album__topLevelCategory')
    catalogImage_serializer = SlimCatalogImageSerializer(
        similar_products, many=True, context={'request': request})
    data = catalogImage_serializer.data
    return JsonResponse(data, safe=False)


class AlbumImagesApiView(APIView, CurserResultsSetPagination):
    ordering = ('image_order', 'id',)

    def get_ordering(self, request, queryset, view):
        ret = super().get_ordering(request, queryset, view)
        if self.top_album == 'new' or (self.top_album == 'campaigns' and not self.album):
            if (queryset.model == CatalogImage):
                return ('-date_created', 'id',)
            elif (queryset.model == ThroughImage):
                return ('-catalogImage__date_created', 'catalogImage__id',)

        else:
            if (queryset.model == ThroughImage):
                return ('catalogAlbum__album_order', 'image_order',)
            return ret

    def get_queryset(self):
        # get the album id from the url
        # album_id = self.request.GET.get('album_id')
        # get the album object
        # get the images for the album
        ##images = self.album.images.order_by('throughimage__image_order')
        if self.top_album:
            if self.top_album == 'new':
                # .order_by('catalogImage')#.distinct('catalogImage__id')
                qs = CatalogImage.objects.filter(is_active=True)
                #qs = qs.order_by('catalogImage_id').distinct('catalogImage_id')
            elif self.top_album == 'campaigns':
                all_user_campaigns = get_user_active_campaigns(
                    self.request.user)
                if all_user_campaigns:
                    all_albums = CatalogAlbum.objects.filter(
                        campain__in=all_user_campaigns)
                    qs = CatalogImage.objects.filter(
                        albums__in=all_albums).distinct()
                else:
                    qs = CatalogImage.objects.none()
            else:
                qs = ThroughImage.objects.filter(
                    catalogAlbum__topLevelCategory__slug=self.top_album).order_by('image_order')
                qs = qs.select_related('catalogImage', 'catalogAlbum')
            #qs = CatalogImage.objects.filter(albums__topLevelCategory__id=self.top_album).order_by('throughimage__image_order')
        # return paginated images
        if self.album:
            qs = ThroughImage.objects.filter(
                catalogAlbum=self.album).order_by('image_order')
            #qs = CatalogImage.objects.filter(albums__id=self.album_id).order_by('throughimage__image_order')
            qs = qs.select_related('catalogImage', 'catalogAlbum')

        # filter only is_active images for both instances ThroughImage and CatalogImage
        if qs.model is CatalogImage:
            qs = qs.prefetch_related('albums',).select_related(
                'main_public_album', 'main_public_album__topLevelCategory')
            qs = qs.filter(Q(is_active=True) and ~Q(main_public_album=None) and ~Q(
                main_public_album__topLevelCategory=None))
            qs = qs.distinct()
        else:
            qs = qs.prefetch_related('catalogImage', 'catalogImage__albums').select_related(
                'catalogImage__main_public_album', 'catalogImage__main_public_album__topLevelCategory')
            qs = qs.filter(Q(catalogImage__is_active=True) and ~Q(catalogImage__main_public_album=None) and ~Q(
                catalogImage__main_public_album__topLevelCategory=None))
            qs = qs.distinct()

        qs = self.paginate_queryset(qs, self.request)
        # return all the catalogImages of the qs
        return qs

        # get all the catalogImage from the qs as images
        #images = [i.catalogImage for i in qs]
        return self.paginate_queryset(images, self.request)

    def get(self, request):
        self.request = request
        album_slug = request.GET.get('album')
        self.top_album = request.GET.get('top')
        if album_slug:
            self.album = CatalogAlbum.objects.get(slug=album_slug)
        else:
            self.album = None

            cmp_slug = request.GET.get('cmp', None)

            if cmp_slug:
                self.album = CatalogAlbum.objects.get(slug=cmp_slug)
        #self.album = CatalogAlbum.objects.get(id=self.album_id)
        products = self.get_queryset()
        # if the products is of type QuerySet<ThroughImage>
        # convert to QuerySet<CatalogImage>
        if len(products) > 0 and isinstance(products[0], ThroughImage):
            products = [i.catalogImage for i in products]
        #products = [o.catalogImage for o in products]
        #serializer = SlimCatalogImageSerializer(products, many=True, context={'request': request})
        serializer = SlimCatalogImageSerializer(
            products, many=True, context={'request': request})
        response = self.get_paginated_response(serializer.data)
        # top_albums = CatalogAlbum.objects.filter(topLevelCategory__id=self.top_album).order_by('album_order').values('id','title', 'cimage')
        # print('top_albums = ', top_albums)
        # response.data['info'] ={
        #     'album_id': self.album_id,
        #     'top': self.top_album,
        #     'query_string': request.GET.urlencode(),
        #     'top_albums': top_albums
        # }
        # # sleep 1 sec
        # time.sleep(1)
        return response


@api_view(['GET'])
def get_main_albums_for_main_page(request):
    # main = first public non campain catalogAlbum with topLevelCategory = null
    mains = CatalogAlbum.objects.filter(
        is_public=True, show_on_main_page=True).order_by('album_order')
    # get AlbumImagesApiView for each main
    mains_ret = []
    for main in mains:
        my_request = request._request

        # my_request.GET = request.GET.copy()
        # my_request.GET['album_id'] = main.id

        # change request to AlbumImagesApiView
        path = '/my-api/get-album-images?album=' + str(main.slug)
        my_request.path = path
        my_request.GET = request.GET.copy()
        my_request.GET['album'] = main.slug
        # my_request.GET = request.GET.copy()
        # my_request.GET['album_id'] = main.id
        main_ret = {
            'id': main.id,
            'title': main.title,
            'cimage': main.cimage,
            'slug': main.slug,
            'top_slug': main.topLevelCategory.slug,
            'images': AlbumImagesApiView.as_view()(my_request).data
        }
        mains_ret.append(main_ret)
    # if main:
    #     print('main:' ,main)
    #     images = main.images.filter(is_active=True).order_by('throughimage__image_order')
    #     images = images.prefetch_related('colors','sizes','albums','varients').select_related('packingTypeClient')
    #     ser = ImageClientApi(images, many=True,context={
    #         'request': request
    #     })
    #     main_response['images'] = ser.data
    #     main_response['album_id'] = main.id
    #     main_response['album_title'] = main.title
    #     main_response['cimage'] = main.cimage

    # campains_response = {}
    # if request.user and request.user.is_authenticated:
    #     campains_response = get_user_campains_serializer_data(request.user)

    # return JsonResponse({
    #     #'main': main_response,
    #     'campains': campains_response
    # })
    return JsonResponse(mains_ret, safe=False)


class get_products_viewset(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()
    serializer_class = ImageClientApi
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        top_level_category = self.request.GET.get('top_level_id')
        albums = self.request.GET.get('album_ids', '')
        if albums == 'all':
            albums = None
        else:
            albums = albums.split('-')  # .remove('')
            try:
                albums.remove('')
            except:
                pass
        if albums:
            queryset = CatalogImage.objects.filter(
                Q(albums__id__in=albums) & Q(albums__topLevelCategory=top_level_category))
        else:
            queryset = CatalogImage.objects.filter(
                Q(albums__topLevelCategory=top_level_category))
        #queryset = CatalogImage.objects.all()
        return queryset


def catalogimage_upload_warehouse_excel(request):
    if request.method == "GET":
        return render(request, 'catalogImages/catalogimage_upload_full_excel.html')
    elif request.method == "POST":
        print(request.FILES)
        file = request.FILES['file']
        df = pd.read_excel(file)
        df = df.fillna('')
        for index, row in df.iterrows():
            category = row['קטגוריה']
            product_name = row['שם מוצר']
            cost_price = float(str(row['מחיר עלות ללא מע"מ']).replace(
                '“', '').replace('₪', '') or '1')
            store_price = float(str(row['מחיר חנות ללא מע"מ']).replace(
                '“', '').replace('₪', '') or '1')
            barcode = str(row['ברקוד'])
            has_phisical_barcode = True if row['האם יש ברקוד פיזי (כן/לא)'] == 'כן' else False
            cat_tag = True if row['האם ניתן למיתוג (כן/לא)'] else False
            provider_1 = str(row['ספק-1'])
            # productProviderName_1 = str(row['מקט אצל הספק-1'])
            # provider_2 = str(row['ספק-2'])
            # productProviderName_2 = str(row['מקט אצל הספק-2'])
            # provider_3 = str(row['ספק-3'])
            # productProviderName_3 = str(row['מקט אצל הספק-3'])

            product, is_created = CatalogImage.objects.get_or_create(
                title=product_name)
            product.albums.add(
                CatalogAlbum.objects.get_or_create(title=category)[0])
            product.cost_price = cost_price
            product.store_price = store_price
            product.barcode = barcode
            product.has_physical_barcode = has_phisical_barcode
            product.colors.add(ProductColor.objects.get(name='no color'))
            product.sizes.add(ProductSize.objects.get(size='one size'))
            product.providers.add(Provider.objects.get(name=provider_1))
            product.can_tab = cat_tag
            # if provider_1:
            #     objs = PPN.objects.filter(provider=Provider.objects.get_or_create(name=provider_1)[0], providerProductName=productProviderName_1, product=product)
            #     if(objs.count() == 0):
            #         obj = PPN.objects.create(provider=Provider.objects.get_or_create(name=provider_1)[0], providerProductName=productProviderName_1, product=product)
            #     obj = objs.first()
            #     obj.product = product
            #     obj.buy_price = cost_price
            #     obj.save()
            # if provider_2:
            #     objs = PPN.objects.filter(provider=Provider.objects.get_or_create(name=provider_2)[0], providerProductName=productProviderName_2, product=product)
            #     if(objs.count() == 0):
            #         obj = PPN.objects.create(provider=Provider.objects.get_or_create(name=provider_2)[0], providerProductName=productProviderName_2, product=product)
            #     obj = objs.first()
            #     obj.product = product
            #     obj.buy_price = cost_price
            #     obj.save()
            # if provider_3:
            #     objs = PPN.objects.filter(provider=Provider.objects.get_or_create(name=provider_3)[0], providerProductName=productProviderName_3, product=product)
            #     if(objs.count() == 0):
            #         obj = PPN.objects.create(provider=Provider.objects.get_or_create(name=provider_3)[0], providerProductName=productProviderName_3, product=product)
            #     obj = objs.first()
            #     obj.product = product
            #     obj.buy_price = cost_price
            #     obj.save()
            product.save()
        return redirect('/admin/catalogImages/catalogimage/')


def catalogimage_upload_slim_excel(request):
    if request.user.is_superuser:
        if request.method == "GET":
            return render(request, 'catalogImages/catalogimage_upload_slim_excel.html')
        elif request.method == "POST":
            print(request.FILES)
            file = request.FILES['file']
            print(file)
            df = pd.read_excel(file)
            df = df.fillna('')
            # print(df.columns) #Index(['כותרת', 'תיאור', 'מחיר עלות ללא מע"מ', 'ספקים', 'ברקוד', 'קטגוריות'], dtype='object')
            for index, row in df.iterrows():
                title = row['כותרת']
                description = row['תיאור']
                cost_price = row['מחיר עלות ללא מע"מ']
                providers = [x.strip() for x in row['ספקים'].split(',')]
                barcode = row['ברקוד']
                categories = [x.strip() for x in row['קטגוריות'].split(',')]
                obj, is_created = CatalogImage.objects.get_or_create(
                    title=title)
                obj.description = description
                obj.cost_price = cost_price
                obj.barcode = barcode
                providers_objs = []
                if providers is not None:
                    for provider in providers:
                        p = Provider.objects.filter(name=provider)
                        if(p.count() != 0):
                            providers_objs.append(p[0])
                    obj.providers.set(providers_objs)

                categories_objs = []
                if categories is not None:
                    for category in categories:
                        c = CatalogAlbum.objects.filter(title=category)
                        if(c.count() != 0):
                            categories_objs.append(c[0])
                    print('title: ', title, 'categories: ', categories_objs)
                    obj.albums.set(categories_objs)
                    obj.save()
                if(is_created):
                    messages.add_message(
                        request, messages.INFO, f'[חדש\t, {title}\t, {provider}\t]')
                else:
                    messages.add_message(
                        request, messages.INFO, f'[קיים\t, {title}\t, {provider}\t]')

            return redirect('/admin/catalogImages/catalogimage/')


@csrf_exempt
def admin_remove_product_from_cart(request):
    ret = {}
    if request.method == "POST" and request.user.is_superuser:
        data = json.loads(request.body.decode('utf8'))
        afected_rows = SvelteCartProductEntery.objects.filter(
            id=data['entry_id']).delete()
        ret = {'afected_rows': afected_rows[0]}
    return JsonResponse(ret)


@csrf_exempt
def admin_add_to_existing_cart(request):
    ret = {}
    if request.method == "POST" and request.user.is_superuser:
        data = request.POST
        print(data)
        # database:
        # ID  PRODUCT כמות    DETAILS
        # 585	חולצת עבודה	555	[{"size_id": 90, "color_id": "86", "quantity": 555}]

        # data:
        # QueryDict: {'object_id': ['113'], '33_77_87': ['0'], '33_77_88': ['0'], '33_77_89': ['0'], '33_77_90': ['0'], '33_77_91': ['0'], '33_77_92': ['0'], '33_77_93': ['0'], '33_78_87': ['0'], '33_78_88': ['0'], '33_78_89': ['0'], '33_78_90': ['0'], '33_78_91': ['0'], '33_78_92': ['0'], '33_78_93': ['0'], '33_79_87': ['0'], '33_79_88': ['0'], '33_79_89': ['0'], '33_79_90': ['0'], '33_79_91': ['0'], '33_79_92': ['0'], '33_79_93': ['0'], '33_80_87': ['0'], '33_80_88': ['0'], '33_80_89': ['0'], '33_80_90': ['0'], '33_80_91': ['0'], '33_80_92': ['0'], '33_80_93': ['0'], '33_81_87': ['0'], '33_81_88': ['0'], '33_81_89': ['0'], '33_81_90': ['0'], '33_81_91': ['0'], '33_81_92': ['0'], '33_81_93': ['0'], '33_83_87': ['0'], '33_83_88': ['0'], '33_83_89': ['0'], '33_83_90': ['0'], '33_83_91': ['0'], '33_83_92': ['0'], '33_83_93': ['0']}>


def get_product_sizes_colors_martix(request, id):
    ret = {}
    if request.user.is_superuser and request.method == "GET":
        catalogImage = CatalogImage.objects.get(pk=id)
        ret = {'sizes': list(catalogImage.sizes.all().values_list('id', 'size')),
               'colors': list(catalogImage.colors.all().values_list('id', 'name', 'color'))}
    return JsonResponse(ret)


def admin_api_get_product_cost_price(request, product_id):
    if request.user.is_superuser:
        ret = {}
        if request.method == "GET":
            catalogImage = CatalogImage.objects.get(pk=product_id)
            ret = {'cost_price': catalogImage.cost_price,
                   'client_price': catalogImage.client_price}
        return JsonResponse(ret)


def all_images_ids(request):
    ret = {}
    if request.method == "GET":
        ret = {'ids':  list(
            CatalogImage.objects.all().values_list('id', flat=True))}
    return JsonResponse(ret)


def create_mini_table(request, id):
    ret = {'actions': []}
    if request.method == "POST":
        print(request)
        catalogImage = CatalogImage.objects.get(pk=id)
        for provider in catalogImage.providers.all():
            print(provider)
            data = CatalogImageDetail.objects.filter(
                provider=provider, parent__in=[id])
            if data.count() == 0:
                obj = CatalogImageDetail.objects.create(provider=provider, cost_price=catalogImage.cost_price,
                                                        client_price=catalogImage.client_price, recomended_price=catalogImage.recomended_price)
                obj.parent.set([id])
                obj.sizes.set(catalogImage.sizes.all())
                obj.colors.set(catalogImage.colors.all())
                ret['actions'].append(
                    {'code': 'new', 'msg': f'[חדש\t, {catalogImage.title}\t, {provider.name}\t]'})
            else:
                ret['actions'].append(
                    {'code': 'exist', 'msg': f'[קיים\t, {catalogImage.title}\t, {provider.name}\t]'})
            print(data)
    return JsonResponse(ret)


class SvelteCatalogImageViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()
    serializer_class = CatalogImageApiSerializer


# Create your views here.
class CatalogImageViewSet(viewsets.ModelViewSet):
    queryset = CatalogImage.objects.all()
    serializer_class = CatalogImageSerializer

    def update(self, request, pk=None):
        serializer_context = {
            'request': request,
        }
        print('hey hey', request, pk, format)
        obj = self.get_object(pk)
        serializer = CatalogImageSerializer(
            obj, data=request.data, context=serializer_context)
        if serializer.is_valid():
            print('serializer is valid, saving...')
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
