from audioop import reverse
from html import entities
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
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

@api_view(['GET'])
def get_product_inventory(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    if request.method == 'GET':
        productId =  int(request.GET.get('product_id'))
        providers = request.GET.get('providers')
        qs = ProductEnterItems.objects.filter(sku__ppn__product = productId)
        if providers == '7':
            pass
        else:
            providerIds = [int(x) for x in providers.split(',')]
            qs = qs.filter(sku__ppn__provider__id__in = providerIds)
        context = {}
        # get all products in the first warehouse
        
        context['products'] = ProductEnterItemsSerializer(qs, many=True).data
        
        return JsonResponse(context)

# Create your views here.
def doc_stock_list(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)

    context = {}
    #context['my_data'] = {'doc_stock_list': DocStockEnter.objects.all()}
    data = DocStockEnterSerializerList(DocStockEnter.objects.all(), many=True).data
    context['my_data'] = {'doc_stock_list': data}
    return render(request, 'doc_stock_list.html', context=context)
def doc_stock_list_api(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    
    if request.method == 'GET':
        doc_stock_list = DocStockEnter.objects.all()
        serializer = DocStockEnterSerializer(doc_stock_list, many=True)
        return JsonResponse(serializer.data, safe=False)
#@permission_required('inventory.view_docstockenter')
def doc_stock_enter(request, id):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'doc_stock_enter.html', context=context)

def doc_stock_detail_api(request, id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'GET':
        doc = DocStockEnter.objects.get(id=id)
        serializer = DocStockEnterSerializer(doc)
        return JsonResponse(serializer.data)

from .models import SKUM, ProductEnterItems, ProductEnterItemsEntries

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
def add_doc_stock_enter_ppn(request):
    print(request)
    print(request.data)
    ppn_id = request.data.get('item_id')
    cost = request.data.get('item_cost')
    #barcode = request.data.get('item_barcode')
    doc_id = request.data.get('doc_id')
    enter_document = DocStockEnter.objects.get(id=doc_id)
    ppn = PPN.objects.get(id=ppn_id)
    old_items = enter_document.items.all()
    old_item = old_items.filter(ppn=ppn)
    if old_item.exists():
        old_item = old_item.first()
    else:
        old_item = ProductEnterItems.objects.create(ppn=ppn, price=cost)
        old_item.doc.set([enter_document])
    print(old_item)
    old_item.save()
    print(old_item)
    
    print('============= path ', request.path)
    #doc = DocStockEnter.objects.get(id=id)
    serializer = DocStockEnterSerializer(enter_document)
    return JsonResponse(serializer.data)
    pass
@api_view(['POST'])
def enter_doc_edit(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    
    data = request.data
    id = request.data.get('id')
    doc_data = request.data.get('doc_data')
    
    
    print(data)
    id = data.get('id')
    
    # TODO: save the headers
    
    for item in doc_data.get('items'):
        
        item_id = item.get('id')
        item_obj = ProductEnterItems.objects.get(id=item_id)
        for entry in item.get('entries'):
            entry_id = entry.get('id', None)
            if entry_id:
                entry_obj = ProductEnterItemsEntries.objects.get(id=entry_id)
                entry_obj.quantity = entry.get('quantity')
                entry_obj.save()
            else:
                size = int(entry.get('size'))
                color = int(entry.get('color'))
                verient = int(entry.get('verient'))
                quantity=entry.get('quantity')
                entry_obj = ProductEnterItemsEntries.objects.create(size_id=size, color_id=color, verient_id=verient, quantity=quantity)
                entry_obj.item.set([item_obj])
                entry_obj.save()
        item_obj.save()
    # return the new doc serializer
    doc = DocStockEnter.objects.get(id=id)
    serializer = DocStockEnterSerializer(doc)
    return JsonResponse(serializer.data)

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
    
    
from .serializers import DocStockEnterSerializerList, PPNSerializer, ProductEnterItemsSerializer
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