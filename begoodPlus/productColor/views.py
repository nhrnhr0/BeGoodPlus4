from django.shortcuts import render
from django.http import HttpResponse
import json
from productColor.models import ProductColor

def api_product_colors(request, *args, **kwargs):
    all_colors = ProductColor.objects.only("id", "name")
    colors = []
    for p in all_colors:
        color = {"id":p.id, "name": p.name}
        
        colors.append(color)
    
    prep = {"productColors": colors}
    ret = HttpResponse(json.dumps(prep), content_type="application/json")
    return ret    
