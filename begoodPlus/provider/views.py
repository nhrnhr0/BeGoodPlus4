from django.shortcuts import render
from django.http import HttpResponse
import json

# Create your views here.
from provider.models import Provider
def api_providers(request, *args, **kwargs):
    if request.method == 'GET' and request.user and request.user.is_superuser:
        all_providers = Provider.objects.only("id", "name")
        providers = []
        for p in all_providers:
            provider = {"id":p.id, "name": p.name}
            
            providers.append(provider)
        
        prep = {"providers": providers}
        ret = HttpResponse(json.dumps(prep), content_type="application/json")
        return ret    
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')


from rest_framework.permissions import IsAuthenticated, IsAdminUser

from rest_framework import viewsets
from .models import Provider
from .serializers import SvelteProviderSerializer
from rest_framework.decorators import api_view

class SvelteApiProviderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Provider.objects.all()
    serializer_class = SvelteProviderSerializer

@api_view(['GET'])
def search_providers(request, *args, **kwargs):
    if request.user and request.user.is_superuser:
        if request.method == 'GET':
            search_term = request.GET.get('q')
            if search_term:
                providers = Provider.objects.filter(name__icontains=search_term).values('id', 'name')
                return HttpResponse(json.dumps(list(providers)), content_type='application/json')
            else:
                return HttpResponse(json.dumps([]), content_type='application/json')
        else:
            return HttpResponse(json.dumps([]), content_type='application/json')
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')