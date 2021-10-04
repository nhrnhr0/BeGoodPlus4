from django.shortcuts import render
from django.http import HttpResponse
import json

# Create your views here.
from provider.models import Provider
def api_providers(request, *args, **kwargs):
    all_providers = Provider.objects.only("id", "name")
    providers = []
    for p in all_providers:
        provider = {"id":p.id, "name": p.name}
        
        providers.append(provider)
    
    prep = {"providers": providers}
    ret = HttpResponse(json.dumps(prep), content_type="application/json")
    return ret    



from rest_framework import viewsets
from .models import Provider
from .serializers import SvelteProviderSerializer
class SvelteApiProviderViewSet(viewsets.ModelViewSet):
    queryset = Provider.objects.all()
    serializer_class = SvelteProviderSerializer