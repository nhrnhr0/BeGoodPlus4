from django.shortcuts import render
import json;
from stock.models import Stock
from productColor.models import ProductColor
from productSize.models import ProductSize
from provider.models import Provider
from packingType.models import PackingType
from product.models import Product
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.contrib import messages
from .serializers import stockSerializer
from rest_framework import viewsets

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()#.order_by('id')
    serializer_class = stockSerializer
    
# Create your views here.
def add_multiple_stocks(request, *args, **kwargs):
    if request.is_ajax and request.method == "POST":
        request_data = json.loads(request.POST.get('content', None) )
        print ('request_data: ', request_data)
        product_id = request_data["data"]['product']
        stocks = request_data["data"]['stocks']
        all_objects = []
        for stock in stocks:
            provider_id = stock[0]
            packingType_id = stock[1]
            size_id = stock[2]
            color_id = stock[3]
            amount = stock[4]
            
            
            obj, created = Stock.objects.get_or_create(
                product__id=product_id,
                provider__id=provider_id,
                packingType__id=packingType_id,
                productSize__id=size_id,
                productColor__id=color_id,
                defaults={
                    'productColor': ProductColor.objects.get(pk=color_id),
                    'productSize': ProductSize.objects.get(pk=size_id),
                    'provider': Provider.objects.get(pk=provider_id),
                    'packingType': PackingType.objects.get(pk=packingType_id),
                    'product': Product.objects.get(pk=product_id),
                }
            )
            # throw exeption if user not fill amount
            # TODO: return rigtht error to the client
            obj.amount += int(amount)
            obj.save()
            stock.append(created)
            stock.append(obj.amount)
            #all_objects.append([stock_serial, created])
            
            
        # return HttpResponseRedirect(request_data["next"])
        print(stocks)
        print(request_data)
        return HttpResponse(
            json.dumps(request_data, ensure_ascii=False)
        )
        