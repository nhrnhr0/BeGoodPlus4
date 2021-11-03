from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

# Create your views here.
@api_view(['GET'])
@permission_classes((IsAuthenticated, ))
def whoAmI(request):
    if request.user and request.user.id != None:
        response = {
            'status':'success',
            'username':request.user.username,
            'name': request.user.client.name
        }
        return JsonResponse(response)
    return JsonResponse({'status':'error', 'detail':'user not loged in'})
