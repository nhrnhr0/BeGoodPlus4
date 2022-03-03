from django.http.response import JsonResponse
from django.shortcuts import render

from core.models import SvelteCartProductEntery
from .models import CatalogImage
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import CatalogImageSerializer, CatalogImageApiSerializer
from rest_framework.request import Request
from catalogImageDetail.models import CatalogImageDetail
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def admin_remove_product_from_cart(request):
    ret = {}
    if request.method == "POST" and request.user.is_superuser:
        data = request.POST
        ret = SvelteCartProductEntery.objects.filter(id=data['entry_id']).delete()
        print (ret)
    pass
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
        ret = {'sizes': list(catalogImage.sizes.all().values_list('id','size')),
            'colors': list(catalogImage.colors.all().values_list('id','name','color'))}
    return JsonResponse(ret)

def admin_api_get_product_cost_price(request, product_id):
    if request.user.is_superuser:
        ret = {}
        if request.method == "GET":
            catalogImage = CatalogImage.objects.get(pk=product_id)
            ret = {'cost_price': catalogImage.cost_price}
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
                ret['actions'].append({'code':'new','msg': f'[חדש\t, {catalogImage.title}\t, {provider.name}\t]'})
            else:
                ret['actions'].append({'code':'exist','msg': f'[קיים\t, {catalogImage.title}\t, {provider.name}\t]'})
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
