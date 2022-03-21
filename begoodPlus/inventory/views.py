from audioop import reverse
from html import entities
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from catalogImages.models import CatalogImageVarient
from color.models import Color
from productSize.models import ProductSize
from provider.models import Provider
from inventory.models import PPN
from rest_framework.decorators import api_view
from inventory.models import DocStockEnter
from inventory.serializers import DocStockEnterSerializer
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.decorators import login_required

# Create your views here.
#@permission_required('inventory.view_docstockenter')
def doc_stock_enter(request, id):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'doc_stock_enter.html', context=context)


from .models import SKUM, ProductEnterItems

def show_inventory_stock(request):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    # get all products in the first warehouse
    products = ProductEnterItems.objects.filter(doc__warehouse__name='מחסן ראשי')
    products = products.select_related('sku', 'sku__ppn', 'sku__size', 'sku__color', 'sku__verient')
    context['my_data'] = {'products':ProductEnterItemsSerializer(products, many=True).data}
    return render(request, 'show_inventory.html', context=context)

@api_view(['POST'])
def add_doc_stock_enter_ppn_entry(request):
    if(request.method == 'POST' and request.user.is_superuser):
        ver = request.data.get('ver')
        size = request.data.get('size')
        color = request.data.get('color')
        amount = request.data.get('amount')
        sku_ppn_id = request.data.get('sku_ppn_id')
        price = request.data.get('price')
        doc_id = request.data.get('doc_id')
        docObj = DocStockEnter.objects.get(id=doc_id)
        sizeObj = ProductSize.objects.get(size=size)
        colorObj = Color.objects.get(name=color)
        ppnObj = PPN.objects.get(id=sku_ppn_id)
        verObj = None
        if ver:
            verObj = CatalogImageVarient.objects.get(name=ver)
        sku, is_created = SKUM.objects.get_or_create(ppn=ppnObj,size=sizeObj,color=colorObj,verient=verObj)
        entryObjs = docObj.items.filter(sku=sku)
        if len(entryObjs) > 1:
            print('error: ', entryObjs)
            return
        elif len(entryObjs) == 0:
            entryObj = ProductEnterItems(sku=sku, quantity=amount, price=price)
            entryObj.save()
            docObj.items.add(entryObj)
        else:
            entryObj = entryObjs[0]
            entryObj.quantity = amount
            entryObj.price = price
        
        #entryObjs = ProductEnterItems.objects.filter(sku, DocStockEnter__in=doc_id)
        #print(entryObjs)
        
        #entryObj.price = price
        #entryObj.quantity = amount
        #docObj.items.add(entryObj)
        
        return get_doc_stock_enter_ppn_entries_logic(request, doc_id, sku_ppn_id)
    

@api_view(['POST'])
def delete_doc_stock_enter_ppn_entry(request):
    if request.user.is_superuser:
        docId = request.data.get('docId')
        ppnId = request.data.get('ppnId')
        entryId = request.data.get('entryId')
        obj = ProductEnterItems.objects.get(id=entryId)
        obj.delete()
        return get_doc_stock_enter_ppn_entries_logic(request, docId, ppnId)
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')

def get_doc_stock_enter_ppn_entries_logic(request, docId, ppnId):
    if docId == None or ppnId == None:
        print('could not get docId or ppnId')
    else:
        if request.user.is_superuser:
            
            doc = DocStockEnter.objects.get(id=docId)
            entries = doc.items.filter(sku__ppn__id=ppnId)
            entries = entries.select_related('sku', 'sku__ppn', 'sku__size', 'sku__color', 'sku__verient')
            serializer = ProductEnterItemsSerializer(entries, many=True)
            return HttpResponse(json.dumps(serializer.data), content_type='application/json')
    return HttpResponse(json.dumps([]), content_type='application/json')

@api_view(["GET"])
def get_doc_stock_enter_ppn_entries(request):
    docId = request.GET.get('docId')
    ppnId = request.GET.get('ppnId')
    return get_doc_stock_enter_ppn_entries_logic(request, docId, ppnId)
    # if the user is not superuser:
    #   return error
    '''
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('admin:index'))
    if request.method == 'GET':
        doc = DocStockEnter.objects.get(id=docId)
        entities = doc.items.filter(ppn__id=ppnId)
        serializer = ProductEnterItemsSerializer(entities, many=True)
        return HttpResponse(json.dumps(serializer.data), content_type='application/json')
        
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')
    '''

from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import permissions
class DocStockEnterViewSet(RetrieveUpdateDestroyAPIView):
    queryset = DocStockEnter.objects.all().prefetch_related('items', 'items__sku', 'items__sku__ppn','items__sku__size','items__sku__size', 'items__sku__color','items__sku__verient', 'items__sku__ppn__provider','items__sku__ppn__product',)
    serializer_class = DocStockEnterSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "id"
    
    
from .serializers import PPNSerializer, ProductEnterItemsSerializer
import json
def search_ppn(request):
    # if the user is not superuser:
    #   return error
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('admin:index'))
    if request.method == 'GET':
        search_term = request.GET.get('q')
        provider = request.GET.get('provider')
        if search_term:
            ppns= PPN.objects.filter(providerProductName__icontains=search_term,provider__name=provider)#.values('id', 'product', 'provider' 'providerProductName')
            serializer = PPNSerializer(ppns, many=True)
            return HttpResponse(json.dumps(serializer.data), content_type='application/json')
        else:
            return HttpResponse(json.dumps([]), content_type='application/json')
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')