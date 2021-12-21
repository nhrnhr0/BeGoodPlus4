from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .serializers import ProductSerializer
from .models import Product
from django.http import HttpResponse
import json


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()#.order_by('id')
    serializer_class = ProductSerializer

def products_select_all(reqest, *args, **kwargs):
    return products_select(reqest, '', *args, **kwargs)

from productImages.models import ProductImage
from django.db.models import Q
def products_select(request,phrash,  *args, **kwargs):

    #qs_products = Product.objects.filter(Q(name__contains=phrash) | Q(content__contains=phrash))
    qs_products = Product.objects.all().filter(Q(name__contains=phrash) | Q(content__contains=phrash))
    #qs_products = qs_products.values('id', 'name', 'content',)
    products = []
    for p in qs_products:
        product = {"id":p.id, "name": p.name, "content": p.content, "catalog":p.customer_catalog_gen(), "suport_printing":p.suport_printing,"suport_embroidery":p.suport_embroidery }
        image = ProductImage.objects.filter(product=product["id"]).first()
        if image != None:
            product['image'] = image.image.url

        products.append(product)
    
    prep = {"inputPhrase": phrash, "products": products}
    ret = HttpResponse(json.dumps(prep), content_type="application/json")
    return ret



from stock.models import Stock
from productSize.models import ProductSize
from productColor.models import ProductColor
#TODO: improve this code
def product_detail(request, id, *args, **kwargs):
    product = Product.objects.get(id=id)
    sizes = ProductSize.objects.all()
    colors = ProductColor.objects.all()
    stocks = Stock.objects.filter(product=product).order_by('productSize')
    details = []
    for s in stocks:
        detail = {"id":s.id,"size":s.productSize.size,
            "color": s.productColor.color,
            "cname": s.productColor.name,
            }
        details.append(detail)

    response = {}
    for d in details:
        response.setdefault(d["size"], [])
        response[d["size"]].append({"color":d["color"], "cname": d["cname"]})
    ret = HttpResponse(json.dumps(response), content_type="application/json")
    return ret
