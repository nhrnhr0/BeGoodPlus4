from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view

from smartbee.models import SmartbeeResults
# Create your views here.
@api_view(['GET'])
def get_smartbee_doc(request, doc_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to access this resource'}, status=401)
    else:
        res = SmartbeeResults.request_smartbee_doc(doc_id)
        print(res)
        return JsonResponse(res)