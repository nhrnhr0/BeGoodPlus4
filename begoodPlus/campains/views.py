from django.shortcuts import render
from catalogImages.models import CatalogImage
from catalogImages.serializers import CatalogImageApiSerializer
from campains.serializers import AdminProductCampainSerilizer, ClientMonthCampainSerializer
from rest_framework.decorators import api_view, permission_classes

from campains.models import MonthCampain, CampainProduct, PriceTable
from campains.serializers import AdminMonthCampainSerializer
from django.http import JsonResponse
import json
from io import StringIO
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
# Create your views here.
# api view to get all the active campains of a user

def get_user_campains_serializer_data(user):
    if(user.is_anonymous):
        return {}
    campains = MonthCampain.objects.filter(is_shown=True, users__in=[user.client], endTime__gte=timezone.now(), startTime__lte=timezone.now())
    serializer = ClientMonthCampainSerializer(campains, many=True)
    return serializer.data

@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def get_user_campains(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            
            
            return JsonResponse(get_user_campains_serializer_data(request.user), safe=False)
        else:
            return JsonResponse({
                'status':'fail',
                'detail':'You are not authorized to perform this action'
            })
    else:
        return JsonResponse({
                'status':'fail',
                'detail':'Only GET requests are allowed'
            })

# api get request to get all the campains as json with serializer
# fail if the user is not logged in and not superuser
def admin_get_all_campains(request):
    if(request.method == 'GET'):
        if(request.user.is_superuser):
            campains = MonthCampain.objects.all()
            
            serializer = AdminMonthCampainSerializer(campains, many=True)
            return JsonResponse(serializer.data, safe=False)#
        else:
            return JsonResponse({
                'status':'fail',
                'detail':'You are not authorized to perform this action'
            })
            
def admin_get_campain_products(request, campain_id):
    if(request.method == 'GET'):
        if(request.user.is_superuser):
            campain = MonthCampain.objects.get(id=campain_id)
            products = CampainProduct.objects.filter(monthCampain=campain)
            serializer = AdminProductCampainSerilizer(products, many=True)
            return JsonResponse(serializer.data, safe=False)
        else:
            return JsonResponse({
                'status':'fail',
                'detail':'You are not authorized to perform this action'
            })
    if(request.method == 'POST'):
        if(request.user.is_superuser):
            campain = MonthCampain.objects.get(id=campain_id)
            
            bytes_str = request.body.decode('UTF-8')
            data = json.loads(bytes_str)
            

            products = CampainProduct.objects.filter(monthCampain=campain)
            for p in products:
                p.priceTable.all().delete()
                #prices = PriceTable.objects.filter(campainProduct=p)
                #prices.delete()
            products.delete()
            new_products = []
            for prod in data:
                id=prod.get('id')
                order=prod.get('order')
                catalogImage=prod.get('catalogImage')
                priceTable=prod.get('priceTable')
                
                data, is_created = CampainProduct.objects.get_or_create(id=id,monthCampain=campain,order=order,catalogImage_id=catalogImage)
                
                prices = []
                for price in priceTable:
                    pri = PriceTable.objects.create(**price)
                    prices.append(pri)
                data.priceTable.set(prices)
                print(is_created, data)
                new_products.append(data)
            #serializer = AdminProductCampainSerilizer(data, many=True)
            campain.save()
            serializer = AdminProductCampainSerilizer(new_products, many=True)
            print(serializer.data)
            return JsonResponse(serializer.data, safe=False)
        else:
            return JsonResponse({
                'status':'fail',
                'detail':'You are not authorized to perform this action'
            })