from django.shortcuts import render

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