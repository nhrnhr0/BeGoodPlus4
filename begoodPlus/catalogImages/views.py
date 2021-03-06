from django.http.response import JsonResponse
from django.shortcuts import redirect, render
from catalogAlbum.models import CatalogAlbum

from core.models import SvelteCartProductEntery
from inventory.models import PPN
from productColor.models import ProductColor
from productSize.models import ProductSize
from .models import CatalogImage
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import CatalogImageSerializer, CatalogImageApiSerializer
from rest_framework.request import Request
from catalogImageDetail.models import CatalogImageDetail
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import json
from django.contrib import messages

import pandas as pd
from provider.models import Provider
def create_image_from_exel(request):
    context= {}
    if(request.method == "POST"):
        products= []
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
                products.append({'title': obj.title, 'price': productPrice, 'id': obj.id, 'cimage': obj.cimage})
        context['products'] = products
        return render(request, 'catalogImages/create_image_from_exel_result.html', context=context)
    return render(request, 'catalogImages/create_image_from_exel.html', context=context)
def catalogimage_upload_warehouse_excel(request):
    if request.method == "GET":
        return render(request, 'catalogImages/catalogimage_upload_full_excel.html')
    elif request.method == "POST":
        print(request.FILES)
        file = request.FILES['file']
        df = pd.read_excel(file)
        df = df.fillna('')
        for index, row in df.iterrows():
            category = row['??????????????']
            product_name = row['???? ????????']
            cost_price = float(str(row['???????? ???????? ?????? ????"??']).replace('???','').replace('???', '') or '1')
            store_price = float(str(row['???????? ???????? ?????? ????"??']).replace('???','').replace('???', '') or '1')
            barcode = str(row['??????????'])
            has_phisical_barcode = True if row['?????? ???? ?????????? ???????? (????/????)'] == '????' else False
            cat_tag = True if row['?????? ???????? ???????????? (????/????)'] else False
            provider_1 = str(row['??????-1'])
            # productProviderName_1 = str(row['?????? ?????? ????????-1'])
            # provider_2 = str(row['??????-2'])
            # productProviderName_2 = str(row['?????? ?????? ????????-2'])
            # provider_3 = str(row['??????-3'])
            # productProviderName_3 = str(row['?????? ?????? ????????-3'])
            
            product, is_created = CatalogImage.objects.get_or_create(title=product_name)
            product.albums.add(CatalogAlbum.objects.get_or_create(title=category)[0])
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
            #print(df.columns) #Index(['??????????', '??????????', '???????? ???????? ?????? ????"??', '??????????', '??????????', '????????????????'], dtype='object')
            for index, row in df.iterrows():
                title = row['??????????']
                description = row['??????????']
                cost_price = row['???????? ???????? ?????? ????"??']
                providers = [x.strip() for x in row['??????????'].split(',')]
                barcode = row['??????????']
                categories = [x.strip() for x in  row['????????????????'].split(',')]
                obj, is_created = CatalogImage.objects.get_or_create(title=title)
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
                    messages.add_message(request, messages.INFO, f'[??????\t, {title}\t, {provider}\t]')
                else:
                    messages.add_message(request, messages.INFO, f'[????????\t, {title}\t, {provider}\t]')

            return redirect('/admin/catalogImages/catalogimage/')


@csrf_exempt
def admin_remove_product_from_cart(request):
    ret = {}
    if request.method == "POST" and request.user.is_superuser:
        data = json.loads(request.body.decode('utf8'))
        afected_rows = SvelteCartProductEntery.objects.filter(id=data['entry_id']).delete()
        ret = {'afected_rows': afected_rows[0]}
    return JsonResponse(ret)
    
@csrf_exempt
def admin_add_to_existing_cart(request):
    ret = {}
    if request.method == "POST" and request.user.is_superuser:
        data = request.POST
        print(data)
        # database:
        # ID  PRODUCT ????????    DETAILS
        # 585	?????????? ??????????	555	[{"size_id": 90, "color_id": "86", "quantity": 555}]
        
        # data:
        # QueryDict: {'object_id': ['113'], '33_77_87': ['0'], '33_77_88': ['0'], '33_77_89': ['0'], '33_77_90': ['0'], '33_77_91': ['0'], '33_77_92': ['0'], '33_77_93': ['0'], '33_78_87': ['0'], '33_78_88': ['0'], '33_78_89': ['0'], '33_78_90': ['0'], '33_78_91': ['0'], '33_78_92': ['0'], '33_78_93': ['0'], '33_79_87': ['0'], '33_79_88': ['0'], '33_79_89': ['0'], '33_79_90': ['0'], '33_79_91': ['0'], '33_79_92': ['0'], '33_79_93': ['0'], '33_80_87': ['0'], '33_80_88': ['0'], '33_80_89': ['0'], '33_80_90': ['0'], '33_80_91': ['0'], '33_80_92': ['0'], '33_80_93': ['0'], '33_81_87': ['0'], '33_81_88': ['0'], '33_81_89': ['0'], '33_81_90': ['0'], '33_81_91': ['0'], '33_81_92': ['0'], '33_81_93': ['0'], '33_83_87': ['0'], '33_83_88': ['0'], '33_83_89': ['0'], '33_83_90': ['0'], '33_83_91': ['0'], '33_83_92': ['0'], '33_83_93': ['0']}>
        

def get_product_sizes_colors_martix(request, id):
    ret = {}
    if request.user.is_superuser and request.method == "GET":
        catalogImage = CatalogImage.objects.get(pk=id)
        ret = {'sizes': list(catalogImage.sizes.all().values_list('id','size')),
            'colors': list(catalogImage.colors.all().values_list('id','name','color'))}
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
        ret ={ 'ids':  list(CatalogImage.objects.all().values_list('id', flat=True))}
    return JsonResponse(ret)

def create_mini_table(request, id):
    ret = {'actions':[]}
    if request.method == "POST":
        print(request);
        catalogImage = CatalogImage.objects.get(pk=id)
        for provider in catalogImage.providers.all():
            print(provider)
            data = CatalogImageDetail.objects.filter(provider=provider, parent__in=[id])
            if data.count() == 0:
                obj = CatalogImageDetail.objects.create(provider=provider, cost_price=catalogImage.cost_price,
                    client_price=catalogImage.client_price, recomended_price=catalogImage.recomended_price)
                obj.parent.set([id])
                obj.sizes.set(catalogImage.sizes.all())
                obj.colors.set(catalogImage.colors.all())
                ret['actions'].append({'code':'new','msg': f'[??????\t, {catalogImage.title}\t, {provider.name}\t]'})
            else:
                ret['actions'].append({'code':'exist','msg': f'[????????\t, {catalogImage.title}\t, {provider.name}\t]'})
            print(data);
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
        serializer = CatalogImageSerializer(obj, data=request.data, context=serializer_context)
        if serializer.is_valid():
            print('serializer is valid, saving...')
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
