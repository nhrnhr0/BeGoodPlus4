from django.shortcuts import render
from catalogImages.models import CatalogImage
from catalogImages.serializers import CatalogImageApiSerializer
from campains.serializers import AdminProductCampainSerilizer

from campains.models import MonthCampain
from campains.serializers import AdminMonthCampainSerializer
from django.http import JsonResponse
# Create your views here.

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
            products = campain.products.order_by('campainproduct__order')
            ret = []
            for p in products:
                data = list(p.campainproduct_set.values('id', 'catalogImage_id', 'order'))[0]
                catalog_image_id = data.get('catalogImage_id')
                image = CatalogImageApiSerializer(CatalogImage.objects.get(id=catalog_image_id))
                image['order'] = data.get('order')
                image['entry_id'] = data.get('id')
                #data['catalogImage'] = image.data
                ret.append(image)
            ret = ''.join(ret)
            #serializer = AdminProductCampainSerilizer(products, many=True)
            return JsonResponse(ret, safe=False)#
        else:
            return JsonResponse({
                'status':'fail',
                'detail':'You are not authorized to perform this action'
            })
            
