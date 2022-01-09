from django.http.response import JsonResponse
from django.shortcuts import render
from .models import CatalogImage
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import CatalogImageSerializer, CatalogImageApiSerializer
from rest_framework.request import Request
from catalogImageDetail.models import CatalogImageDetail
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
