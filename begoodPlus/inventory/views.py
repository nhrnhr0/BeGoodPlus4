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
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy  as _


@api_view(['GET'])
def search_warehouses(request, *args, **kwargs):
    if request.user and request.user.is_superuser:
        if request.method == 'GET':
            search_term = request.GET.get('q')
            if search_term:
                warehouses = Warehouse.objects.filter(name__icontains=search_term).values('id', 'name')
                return HttpResponse(json.dumps(list(warehouses)), content_type='application/json')
            else:
                return HttpResponse(json.dumps([]), content_type='application/json')
        else:
            return HttpResponse(json.dumps([]), content_type='application/json')
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')
    

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
        doc_stock_list = DocStockEnter.objects.all().select_related('provider','warehouse','byUser')
        serializer = DocStockEnterListSerializer(doc_stock_list, many=True)
        return JsonResponse(serializer.data, safe=False)
#@permission_required('inventory.view_docstockenter')

@api_view(['POST'])
def create_enter_doc(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'POST':
        data = request.data
# invoice_number
# description
# provider
# warehouse

# description
# docNumber
# created_at
# provider
# warehouse
# items
# isAplied
# byUser
# new_products
        provider = data.get('provider', None)
        warehouse = data.get('warehouse', None)
        
        
        if provider:
            provider_id = provider['id']
        
        if warehouse:
            warehouse_id = warehouse
        user = request.user
        
        doc = DocStockEnter.objects.create(
            description= data.get('description',''),
            docNumber= data.get('invoice_number', ''),
            provider_id= provider_id,
            warehouse_id= warehouse_id,
            byUser= user,)
        doc.save()
        return JsonResponse({'status': 'ok',
                            'id': doc.id})

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

from .models import SKUM, ProductEnterItems, ProductEnterItemsEntries, Warehouse, WarehouseStock, WarehouseStockHistory

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
    barcode = request.data.get('item_barcode')
    has_phisical_barcode = request.data.get('has_phisical_barcode')
    #warehouse = request.data.get('item_warehouse')
    #barcode = request.data.get('item_barcode')
    doc_id = request.data.get('doc_id')
    enter_document = DocStockEnter.objects.get(id=doc_id)
    ppn = PPN.objects.get(id=ppn_id)
    if ppn.barcode != barcode or ppn.has_phisical_barcode != has_phisical_barcode:
        ppn, is_created = PPN.objects.get_or_create(has_phisical_barcode=has_phisical_barcode,product=ppn.product,provider=ppn.provider,buy_price=ppn.buy_price,store_price=ppn.store_price,providerProductName=ppn.providerProductName,barcode=barcode)
        
    old_items = enter_document.items.all()
    old_item = old_items.filter(ppn=ppn)
    if old_item.exists():
        old_item = old_item.first()
        # old_item.barcode = barcode
        old_item.price = cost
        #old_item.warehouse_id = warehouse
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

@api_view(['GET'])
def get_all_warehouses_api(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'GET':
        warehouses = Warehouse.objects.all()
        serializer = WarehouseSerializer(warehouses, many=True)
        return JsonResponse(serializer.data, safe=False)
@api_view(['POST'])
def enter_doc_insert_inventory(request):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'POST':
        doc_id = request.data.get('doc_id')
        doc = DocStockEnter.objects.get(id=doc_id)
        # insert all items to inventory
        
        doc.isAplied = True
        doc.save() 

@api_view(['DELETE'])
def enter_doc_remove_product(request):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'DELETE':
        item_id = request.data.get('item_id')
        item = ProductEnterItems.objects.get(id=item_id)
        item.delete()
    id = request.data.get('doc_id')
    doc = DocStockEnter.objects.get(id=id)
    serializer = DocStockEnterSerializer(doc)
    return JsonResponse(serializer.data)


@api_view(['POST'])
def inventory_manual_update_entry(request, entry_id):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return JsonResponse({'error': _('You are not authorized')})
    if request.method == 'POST':
        qyt = request.data.get('quantity')
        reson = request.data.get('reson')
        user = request.user
        entry = WarehouseStock.objects.get(id=entry_id)
        
        old_quantity = entry.quantity
        new_quantity = qyt
        note= reson
        user = request.user
        
        
        entry.quantity = qyt
        entry.history.create(
            old_quantity=old_quantity,
            new_quantity=new_quantity,
            note=note,
            user=user
        )
        entry.save()
        
        data = WarehouseStockSerializer(entry).data
        return JsonResponse(data)
    return JsonResponse({'error': _('Expected POST')})


@api_view(['GET'])
def inventory_get_entry_history(request, entry_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'GET':
        entry = WarehouseStock.objects.get(id=entry_id)
        serializer = WarehouseStockHistorySerializer(entry.history.all(), many=True)
        return JsonResponse(serializer.data, safe=False)

@api_view(['POST'])
def inventory_edit_entry(request, entry_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'POST':
        originalEntry = WarehouseStock.objects.get(id=entry_id)
        warehouse_idToMove = request.data.get('warehouse_id')
        if warehouse_idToMove == None:
            return JsonResponse({'error': _('You must select a warehouse')})
        
        originalEntryJson = WarehouseStockSerializer(originalEntry).data
        #stock_id = request.data.get('stock_id')
        
        quantityToMove = request.data.get('quantity')
        
        if originalEntry.quantity < quantityToMove:
            return JsonResponse({'error': _('Not enough stock')})
        originalEntry.quantity -= quantityToMove

        
        newStock, is_created = WarehouseStock.objects.get_or_create(
            warehouse_id = warehouse_idToMove,
            ppn = originalEntry.ppn,
            size = originalEntry.size,
            color = originalEntry.color,
            verient = originalEntry.verient,)
        
        note = 'העברת <b>(%s)</b> פריטים מ <b>%s</b> ל<b>%s</b>' % (quantityToMove, originalEntry.warehouse.name, newStock.warehouse.name)
        originalEntry.history.create(
            old_quantity=originalEntry.quantity + quantityToMove,
            new_quantity=originalEntry.quantity,
            note= note,
            user=request.user
        )
        originalEntry.save()
        newStockJson = WarehouseStockSerializer(newStock).data
        newStock.avgPrice = (newStock.avgPrice * newStock.quantity + originalEntry.avgPrice * quantityToMove) / (newStock.quantity + quantityToMove)
        newStock.quantity += quantityToMove
        newStock.history.create(
            old_quantity=newStock.quantity - quantityToMove,
            new_quantity=newStock.quantity,
            #note= 'סחורה זזה ממחסן ' + originalEntryJson['warehouse']['name'] + ' למחסן ' + newStockJson['warehouse']['name'],
            note= note,
            user = request.user
        )
        newStock.save()
        objs = [newStock, originalEntry]
        data = WarehouseStockSerializer(objs, many=True).data
        data = {
            'old': [originalEntryJson, newStockJson],
            'new': data
        }
        return JsonResponse(data, safe=False)
    pass

def get_stock_by_id_api(request,id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'GET':
        stock = WarehouseStock.objects.get(id=id)
        serializer = WarehouseStockSerializer(stock)
        return JsonResponse(serializer.data)

@api_view(['GET'])
def get_all_inventory_api(request):
    if request.user.is_superuser:
        qs = WarehouseStock.objects.all().select_related('ppn', 'size', 'color', 'verient', 'warehouse', 'ppn__product')
        serializer = WarehouseStockSerializer(qs, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'error': 'You are not authorized'})
    pass
@api_view(['POST'])
def enter_doc_insert_inventory(request, doc_id):
    print('enter_doc_insert_inventory', doc_id)
    if(not request.user.is_superuser):
        return JsonResponse({'error': 'You are not authorized'})
    if request.method == 'POST':
        doc = DocStockEnter.objects.get(id=doc_id)
        # insert all items to inventory
        warehouse = doc.warehouse
        
        for item in doc.items.all():
            ppn = item.ppn
            entries = item.entries.all()
            price = item.price
            barcode = item.ppn.barcode
            has_phisical_barcode = item.ppn.has_phisical_barcode
            ppn2,is_created = PPN.objects.get_or_create(product=ppn.product,provider=ppn.provider, providerProductName=ppn.providerProductName,barcode=barcode,has_phisical_barcode=has_phisical_barcode)
            if is_created:
                ppn2.buy_price = ppn.buy_price
                ppn2.save()
                
            for entry in entries:
                if entry.quantity > 0:
                    warehouse_stock, is_created = WarehouseStock.objects.get_or_create(warehouse=warehouse, ppn=ppn2, size=entry.size, color=entry.color, verient=entry.verient)
                    old_quantity = warehouse_stock.quantity
                    warehouse_stock.quantity = old_quantity + entry.quantity
                    warehouse_stock.avgPrice = (old_quantity * warehouse_stock.avgPrice + entry.quantity * price) / (old_quantity + entry.quantity)
                    
                    user = request.user
                    history = WarehouseStockHistory.objects.create(
                        old_quantity=old_quantity,
                        new_quantity=warehouse_stock.quantity,
                        note= 'טופס הכנסה %s' % doc.docNumber,
                        user= user
                    )
                    history.save()
                    warehouse_stock.history.add(history)
                    warehouse_stock.save()
                
        doc.isAplied = True
        doc.save()
    data = DocStockEnterSerializer(doc).data
    return JsonResponse(data)

@api_view(['POST'])
def enter_doc_edit(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized'})
    
    data = request.data
    id = request.data.get('id')
    doc_data = request.data.get('doc_data')
    
    
    id = data.get('id')
    
    # TODO: save the headers
    newProducts = doc_data.get('new_products')
    
    
    
    for item in doc_data.get('items'):
        
        item_id = item.get('id')
        item_obj = ProductEnterItems.objects.get(id=item_id)
        item_obj.price = item.get('price')
        #item_obj.warehouse_id = item.get('warehouse')
        if item_obj.ppn.barcode != item.get('ppn').get('barcode') or  item_obj.ppn.has_phisical_barcode != item.get('ppn').get('has_phisical_barcode'):
            #item_obj.barcode = item.get('barcode')
            has_phisical_barcode = item.get('ppn').get('has_phisical_barcode')
            barcode = item.get('ppn').get('barcode')
            newPPN, is_created = PPN.objects.get_or_create(
                product=item_obj.ppn.product,
                provider=item_obj.ppn.provider,
                buy_price=item_obj.ppn.buy_price,
                store_price=item_obj.ppn.store_price,
                providerProductName=item_obj.ppn.providerProductName,
                has_phisical_barcode=has_phisical_barcode,
                barcode=barcode
                )
            item_obj.ppn = newPPN
        #item_obj.barcode = item.get('barcode')
        #item_obj.has_phisical_barcode = item.get('has_phisical_barcode')
        for entry in item.get('entries'):
            entry_id = entry.get('id', None)
            if entry_id:
                entry_obj = ProductEnterItemsEntries.objects.get(id=entry_id)
            else:
                size = int(entry.get('size'))
                color = int(entry.get('color'))
                verient_str = entry.get('verient', None)
                if verient_str:
                    verient = int(verient_str)
                else:
                    verient = None
                entry_objs = ProductEnterItemsEntries.objects.filter(item=item_obj, size=size, color=color, verient=verient)
                if entry_objs.exists():
                    entry_obj = entry_objs.first()
                else:
                    entry_obj = ProductEnterItemsEntries.objects.create(size_id=size, color_id=color, verient_id=verient)
                    entry_obj.item.set([item_obj])
                
            entry_obj.quantity = entry.get('quantity')
            entry_obj.save()
        item_obj.save()
    # return the new doc serializer
    doc = DocStockEnter.objects.get(id=id)
    doc.new_products = newProducts
    doc.save()
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
    
    
from .serializers import DocStockEnterListSerializer, DocStockEnterSerializerList, PPNSerializer, ProductEnterItemsSerializer, WarehouseSerializer, WarehouseStockHistorySerializer, WarehouseStockSerializer
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
            ppns= PPN.objects.filter(Q(provider__name=provider) & (Q(providerProductName__icontains=search_term) | Q(product__title__icontains=search_term) | Q(barcode__icontains=search_term)) )#.values('id', 'product', 'provider' 'providerProductName')
            serializer = PPNSerializer(ppns, many=True)
            return HttpResponse(json.dumps(serializer.data), content_type='application/json')
        else:
            return HttpResponse(json.dumps([]), content_type='application/json')
    else:
        return HttpResponse(json.dumps([]), content_type='application/json')