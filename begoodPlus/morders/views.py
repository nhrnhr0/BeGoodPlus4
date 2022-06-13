from ast import Return
import datetime
from gettext import Catalog
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render

from catalogImages.models import CatalogImage
from inventory.models import WarehouseStock
from provider.models import Provider
from smartbee.models import SmartbeeTokens
from .serializers import AdminMOrderItemSerializer, AdminMOrderListSerializer, AdminMOrderSerializer, AdminProviderRequestrSerializer, AdminProviderResuestSerializerWithMOrder, MOrderCollectionSerializer
from morders.models import CollectedInventory, MOrder, MOrderItem, MOrderItemEntry, ProviderRequest, TakenInventory
from rest_framework import status
import json
from rest_framework.decorators import api_view
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse
from django.db import connection, reset_queries

from django.template.loader import get_template

@api_view(['GET'])
def get_all_orders(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "GET":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            data = MOrder.objects.all().prefetch_related('products','products__entries').select_related('client','agent')
            serializer = AdminMOrderListSerializer(data, many=True)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)


def load_all_provider_request_admin(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    data = ProviderRequest.objects.all().prefetch_related('provider').select_related('provider')
    serializer = AdminProviderResuestSerializerWithMOrder(data, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)



def view_morder_stock_document(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    obj = MOrder.objects.get(id=id)
    products = MOrderItem.objects.filter(morder=obj)
    products = products.select_related('product',).prefetch_related('entries',)
    html = render(request, 'morder_stock_document.html', {'order': obj,'products': products})
    return HttpResponse(html)

    
def view_morder_pdf(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    obj = MOrder.objects.get(id=id)
    products = MOrderItem.objects.filter(morder=obj)
    products = products.select_related('product',).prefetch_related('entries',)
    html = render(request, 'morder_pdf.html', {'order': obj,'products': products})
    return HttpResponse(html)




@api_view(['POST'])
def morder_edit_order_add_provider_entries(request,entry_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    orderItem = MOrderItem.objects.get(id=entry_id)
    data_provider = request.data.get('provider')
    data_size = request.data.get('size')
    data_varient = request.data.get('varient')
    data_color = request.data.get('color')
    data_need_phisical_barcode = request.data.get('need_phisical_barcode')
    data_quantity = request.data.get('quantity')
    
    
    print(data_provider)
    print(data_size)
    print(data_varient)
    print(data_color)
    print(data_need_phisical_barcode)
    print(data_quantity)
    existing = orderItem.toProviders.filter(provider_id=data_provider, size_id=data_size, varient_id=data_varient, color_id=data_color, force_physical_barcode=data_need_phisical_barcode)
    if existing.exists():
        entry = existing.first()
        entry.quantity=data_quantity
    else:
        entry = ProviderRequest(provider_id=data_provider, size_id=data_size, varient_id=data_varient, color_id=data_color, force_physical_barcode=data_need_phisical_barcode, quantity=data_quantity)
        entry.save()
    orderItem.toProviders.add(entry)
    data = AdminProviderRequestrSerializer(orderItem.toProviders, many=True).data
    return JsonResponse({'success': 'success','data': data}, status=status.HTTP_200_OK)
    
    pass
@api_view(["POST"])
def morder_edit_order_add_product_entries_2(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        
        entry_id = request.data.get('entry_id')
        color_id = int(request.data.get('color'))
        size_id = int(request.data.get('size'))
        varient_id = request.data.get('varient', None)
        if varient_id:
            varient_id = int(varient_id)
        else: # handle if varient_id is '': make it None
            varient_id = None
        orderObj = MOrderItem.objects.get(id=int(entry_id))
        entry = MOrderItemEntry.objects.filter(
                    orderItem=orderObj,
                    color_id=color_id,
                    size_id=size_id,
                    varient_id=varient_id,
                )
        if entry.exists():
            return JsonResponse({'error': 'This entry already exists'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            entry = MOrderItemEntry.objects.create(
                color_id=color_id,
                size_id=size_id,
                varient_id=varient_id,
                quantity=0
            )
            entry.orderItem.set([orderObj])
            entry.save()
            new_entries = AdminMOrderItemSerializer(orderObj).data
            return JsonResponse({'success': 'success', 'data': new_entries}, status=status.HTTP_200_OK)

@api_view(["POST"])
def morder_edit_order_add_product_entries(request):
    print(request)
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        data = request.data
        arr = [0,1,2,3,4]
        entry_id = data.get('entry_id')
        orderObj = MOrderItem.objects.get(id=int(entry_id))
        for index in arr:
            color_id = data['color_' + str(index)] # color_0
            size_id = data['size_' + str(index)] # size_0
            varient_id = data['varient_' + str(index)] # varient_0
            amount = data['amount_' + str(index)] # amount_0
            color_id = color_id if color_id != '' and color_id != 'undefined' else None
            size_id = size_id if size_id != '' and size_id != 'undefined' else None
            varient_id = varient_id if varient_id != '' and varient_id != 'undefined' else None
            print(color_id, size_id, varient_id, amount)
            if size_id != None and color_id != None:
                objs = MOrderItemEntry.objects.filter(
                    product=orderObj,
                    color_id=int(color_id) if color_id != None else None,
                    size_id=int(size_id) if size_id != None else None,
                    varient_id=int(varient_id) if varient_id != None else None,
                )
                if objs.count() == 0:
                    obj = MOrderItemEntry.objects.create(
                        color_id=int(color_id) if color_id != None else None,
                        size_id=int(size_id) if size_id != None else None,
                        varient_id=int(varient_id) if varient_id != None else None,
                    )
                    obj.product.set([orderObj])
                else:
                    obj = objs.first()
                obj.quantity = int(amount)
                obj.save()
                print(obj)
        new_entries = AdminMOrderItemSerializer(orderObj).data
        return JsonResponse({'success': 'success', 'data': new_entries}, status=status.HTTP_200_OK)

# Create your views here.
def edit_morder(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'morder_edit.html', context=context)

def api_delete_order_data_item(request, row_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "DELETE":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            try:
                obj = MOrderItem.objects.get(id=int(row_id))
                obj.delete()
                return JsonResponse({'success': 'success'}, status=status.HTTP_200_OK)
            except:
                return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["DELETE"])
def api_edit_order_delete_product(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "DELETE":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            try:
                entry_id = request.data.get('entry_id')
                entry = MOrderItem.objects.get(id=int(entry_id))
                entry.delete()
                return JsonResponse({'success': 'success'}, status=status.HTTP_200_OK)
            except:
                return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
def api_edit_order_add_product(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "POST":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            data = json.loads(request.body)
            print(data)
            order_id = data.get('order_id')
            product_id = data.get('product_id')
            objs = MOrderItem.objects.filter(morder=order_id, product_id=product_id)
            print(objs)
            if objs.count() == 0:
                product = CatalogImage.objects.get(id=product_id)
                price = product.client_price
                obj = MOrderItem.objects.create(
                    product_id=product_id,
                    price = price,
                )
                
                obj.morder.set([MOrder.objects.get(id=order_id)]) # TODO: is it important to save the items inside the morder
                obj.save()
                new_entries = AdminMOrderItemSerializer(obj).data
                return JsonResponse({'success': 'success', 'data': new_entries}, status=status.HTTP_200_OK)
            elif objs.count() == 1:
                obj = objs.first()
                new_entries = AdminMOrderItemSerializer(obj).data
                return JsonResponse({'success': 'success', 'data': new_entries}, status=status.HTTP_200_OK)
            else:
                return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
                # TODO: continue from here
                
from django.db import models

from django.db.models import Count, F, Value
from django.db.models import OuterRef, Subquery
from django.db.models import Q
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Sum, Avg, When, Case
from django.db.models.functions import Substr
from django.db.models.functions import Concat
from django.db.models.functions import Length




@api_view(['POST', 'GET'])
def dashboard_orders_collection_smartbee(request,id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    
    print(id)
    morder = MOrder.objects.get(id=id)
    #info = morder_to_smartbe_json(morder)
    info = morder.create_smartbe_order()
    
    return JsonResponse({'success': 'success', 'data': info}, status=status.HTTP_200_OK)

@api_view(['POST'])
def dashboard_orders_collection_collect_save(request):
    print(request)
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    data = json.loads(request.body)
    #print(data)
    for d in data:
        print(d.get('collected', None))
        collected = d.get('collected', None)
        if (collected):
            for [orderItem_id, collected_amount] in collected.items():
                takenInventory = TakenInventory.objects.get(id=orderItem_id)
                warehouseStock_id = d.get('id')
                collectedObj = CollectedInventory.objects.filter(
                    taken_inventory__in=[takenInventory],
                    warehouseStock__id=warehouseStock_id,
                )
                
                if collectedObj.count() == 0:
                    collectedObj = CollectedInventory.objects.create(
                        warehouseStock=WarehouseStock.objects.get(id=warehouseStock_id),
                        quantity=collected_amount,
                    )
                    takenInventory.collected.add(collectedObj)
                else:
                    collectedObj = collectedObj.first()
                collectedObj.quantity = collected_amount
                collectedObj.save()
                # obj.collected_amount = collected_amount
                # obj.save()
    return JsonResponse({'success': 'success'}, status=status.HTTP_200_OK)
    

@api_view(['GET'])
def get_order_detail_to_collect(request):
    #print(request)
    morders_ids = request.GET.get('orders')
    print(morders_ids)
    morders_ids = json.loads(morders_ids)
    morders = MOrder.objects.filter(id__in=morders_ids) #.objects.all()#
    print(morders)
    ret = []
    
    taken_products = TakenInventory.objects.filter(Q(orderItem__morder__in=morders) & (Q(quantity__gt=0) | ~Q(collected=None))).prefetch_related('collected', 'orderItem','orderItem__morder','orderItem__product').select_related('color', 'size', 'varient',)
    taken_products_vals = []
    for taken_product in taken_products:
        d = {
                'id': taken_product.id,
                'orderItem__morder': taken_product.orderItem.first().morder.first().id,
                'orderItem__id': taken_product.orderItem.first().id,
                'orderItem__product__id': taken_product.orderItem.first().product.id, 
                'orderItem__product__cimage': taken_product.orderItem.first().product.cimage, 
                'orderItem__product__title':taken_product.orderItem.first().product.title,
                'quantity': taken_product.quantity,
                'color__id': taken_product.color.id,
                'color__name': taken_product.color.name,
                'color__color': taken_product.color.color,
                'size__id': taken_product.size.id,
                'size__size':taken_product.size.size,
                'size__code': taken_product.size.code,
                'varient__id': taken_product.varient.id if taken_product.varient != None else None,
                'varient__name': taken_product.varient.name if taken_product.varient != None else None,
                'has_physical_barcode': taken_product.has_physical_barcode,
                'provider': taken_product.provider.id,
                'provider__name': taken_product.provider.name,
                'collected': [{'id': c.id, 'quantity': c.quantity, 'warehouseStock__id': c.warehouseStock.id} for c in taken_product.collected.all()],
            }
        taken_products_vals.append(d)
        #[{'id': taken_product.id,'orderItem__morder': taken_product.orderItem.first().morder.id,'orderItem__id': taken_product.orderItem.first().id, 'orderItem__product__id': taken_product.orderItem.first().product.id, 'orderItem__product__cimage': taken_product.orderItem.first().product.cimage, 'orderItem__product__title':taken_product.orderItem.first().product.title,'quantity': taken_product.quantity} for taken_product in taken_products]#, 'collected':[{'quantity': '1'} for colect in taken_product.collected.all()]} for taken_product in taken_products]
        # .values('id', 'orderItem__morder', 'orderItem__id', 'orderItem__product__id','orderItem__product__cimage','orderItem__product__title', 'quantity','color__id', 'color__name','color__color','size__id','size__size','size__code','varient__id','varient__name','has_physical_barcode','provider','provider__name', )\
        #         .order_by('orderItem__product__id',)
                
    taken_product_ids = taken_products.values_list('orderItem__product__id', flat=True).distinct()
    stocks = WarehouseStock.objects.filter(ppn__product__id__in=taken_product_ids)\
        .values('id', 'ppn__product__id', 'ppn__product__title','ppn__provider','ppn__provider__name','ppn__product__cimage', 'quantity','color__id', 'color__color','color__name','size__id', 'size__size','verient__id','verient__name','ppn__barcode','ppn__has_phisical_barcode','ppn__provider', 'warehouse', 'warehouse__name',)
    print(taken_product_ids)
    taken_product_ids_objs = {}
    # create a dict with product_id as key and the list of taken_inventory as value
    # taken_product_ids_objs = {product_id: {order: [taken_inventory, taken_inventory, ...], stocks: [stock, stock, ...]}}
    # for taken_product in taken_products:
    #     if taken_product['product__product__id'] not in taken_product_ids_objs:
    #         taken_product_ids_objs[taken_product['product__product__id']] = {'order': [], 'stocks': []}
    #     taken_product_ids_objs[taken_product['product__product__id']]['order'].append(taken_product)
    # for stock in stocks:
    #     if stock['ppn__product__id'] not in taken_product_ids_objs:
    #         taken_product_ids_objs[stock['ppn__product__id']] = {'order': [], 'stocks': []}
    #     taken_product_ids_objs[stock['ppn__product__id']]['stocks'].append(stock)
    
    pass
    return JsonResponse({'success': 'success', 'taken': taken_products_vals, 'stocks': list(stocks)}, status=status.HTTP_200_OK)
'''
created
client
products: {
    product
    ergent
    prining
    priningComment
    embroidery
    embroideryComment
    comment
    entries: {
        quantity
        color
        size
        varient
    }
}
message
freezeTakenInventory
startCollecting
'''


@api_view(['GET'])
def list_orders_to_collect(request): 
    if request.user.is_superuser == False:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method == "GET":
            orders = MOrder.objects.filter(startCollecting=True)
            serializer = MOrderCollectionSerializer(orders, many=True)
            return JsonResponse(serializer.data,safe=False, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def api_get_order_data2(request, id):
    if request.user.is_superuser == False:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    #data = AdminMOrderSerializer(order).data
    #print('querys: => ', connection.queries)
    
    if request.method == 'POST':
        order = MOrder.objects.select_related('client','agent').prefetch_related('products','products__product__albums','products__taken', 'products__entries','products__entries__color','products__entries__size','products__entries__varient',).get(id=id)# 'products__taken__quantity','products__taken__color','products__taken__size','products__taken__varient','products__taken__barcode','products__taken__has_physical_barcode','products__taken__provider')
        newData = request.data
        order.freezeTakenInventory = newData.get('freezeTakenInventory', False)
        order.sendProviders = newData.get('sendProviders', False)
        order.startCollecting = newData.get('startCollecting', False)
        order.isOrder = newData.get('isOrder', False)
        for product in newData['products']:
            if product['id'] != None:
                item = MOrderItem.objects.get(id=product['id'])
                #obj.quantity = product['quantity']
                item.price = product['price']
                item.prining =product['prining']
                if(item.prining):
                    item.priningComment = product.get('priningComment','')
                else:
                    item.priningComment = ''
                item.embroidery =product['embroidery']
                if(item.embroidery):
                    item.embroideryComment = product.get('embroideryComment', '')
                else:
                    item.embroideryComment = ''
                item.comment =product['comment']
                item.ergent =product['ergent']
                item.save()
            else:
                item = MOrderItem.objects.create(
                    product_id=product['product_id'],
                    price=product['price'],
                    prining=product['prining'],
                    embroidery=product['embroidery'],
                    comment=product['comment'],
                )
                item.morder.set([MOrder.objects.get(id=id)])
                item.save()
            
            
            for provider_entry in product['toProviders']:
                print('toProviders', provider_entry)
                if provider_entry.get('id', None) != None:
                    try:
                        obj = ProviderRequest.objects.get(id=provider_entry['id'])
                        obj.quantity = provider_entry['quantity']
                        obj.orderItem.set([item])
                        obj.save()
                    except ProviderRequest.DoesNotExist:
                        # create new
                        obj = ProviderRequest.objects.create(
                            provider_id=provider_entry['provider'],
                            size_id=provider_entry['size'],
                            varient_id=provider_entry.get('verient', None),
                            color_id=provider_entry['color'],
                            force_physical_barcode=provider_entry['force_physical_barcode'],
                            quantity=provider_entry['quantity'],)
                        obj.orderItem.set([item])
                        obj.save()
                else:
                    # create new
                    obj = ProviderRequest.objects.create(
                        provider_id=provider_entry['provider'],
                        size_id=provider_entry['size'],
                        varient_id=provider_entry.get('verient', None),
                        color_id=provider_entry['color'],
                        force_physical_barcode=provider_entry['force_physical_barcode'],
                        quantity=provider_entry['quantity'],)
                    obj.orderItem.set([item])
                    obj.save()
                if obj.quantity < 0:
                    obj.delete()
            for entry in product['entries']:
                if entry.get('id', None) != None:
                    
                    dbEntry = MOrderItemEntry.objects.get(id=entry['id'])
                    dbEntry.quantity = entry.get('quantity',0) or 0
                    try:
                        dbEntry.validate_unique()
                        dbEntry.save()
                    except:
                        dbEntry.delete()
                    
                    
                else:
                    print(entry)
                    dbEntry = MOrderItemEntry.objects.create(
                        quantity=entry['quantity'],
                        size_id=entry['size'],
                        color_id=entry['color'],
                        varient_id=entry.get('verient', None),
                    )
                    dbEntry.orderItem.set([item])
                    dbEntry.save()
                if dbEntry.quantity < 0:
                    dbEntry.delete()
                # if dbEntry and dbEntry.id and dbEntry.quantity <= -1:
                #     dbEntry.delete()

            for inventory_takes in product['available_inventory']:
                print(inventory_takes)
                # 'size':117
                # 'color':77
                # 'verient':None
                # 'ppn__barcode':''
                # 'ppn__has_phisical_barcode':False
                # 'ppn__provider__name':'המלביש'
                # 'total':10
                # 'taken':4
                objs = item.taken.filter(
                    color_id=inventory_takes['color'],
                    size_id=inventory_takes['size'],
                    varient_id=inventory_takes['verient'],
                    
                    has_physical_barcode=inventory_takes['ppn__has_phisical_barcode'],
                    provider=Provider.objects.get(name=inventory_takes['ppn__provider__name']))
                obj = objs.first()
                if obj == None:
                    obj = TakenInventory.objects.create(
                        color_id=inventory_takes['color'],
                        size_id=inventory_takes['size'],
                        varient_id=inventory_takes['verient'],
                        has_physical_barcode=inventory_takes['ppn__has_phisical_barcode'],
                        provider=Provider.objects.get(name=inventory_takes['ppn__provider__name']),
                        quantity=inventory_takes.get('taken',0),
                        #toOrder=inventory_takes.get('toOrder',0)
                    )
                
                item.taken.add(obj)
                #print('setup', obj.id, ' => ',inventory_takes['taken'])
                obj.quantity = inventory_takes.get('taken',0)
                #obj.toOrder = inventory_takes.get('toOrder',0)
                # if obj.quantity < 0:# and obj.toOrder <= 0:
                #     obj.delete()
                obj.save()
        
        
                
        order.save()
    order = MOrder.objects.select_related('client','agent').prefetch_related('products__toProviders', 'products','products__product__albums','products__taken', 'products__entries','products__entries__color','products__entries__size','products__entries__varient',).get(id=id)# 'products__taken__quantity','products__taken__color','products__taken__size','products__taken__varient','products__taken__barcode','products__taken__has_physical_barcode','products__taken__provider')
    data = AdminMOrderSerializer(order).data
    return JsonResponse(data, status=status.HTTP_200_OK)
@api_view(['GET'])
def api_get_order_data(request, id):
    if not request.user.is_superuser:
        return JsonResponse({'status':'error'}, status=status.HTTP_403_FORBIDDEN)
    order = MOrder.objects.select_related('client','agent').prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient').get(id=id)
    if request.method == 'POST':
        data = json.loads(request.body)
        order.status = data['status']
        order.message = data['message']
        for product in data['products']:
            '''
                'id':258
                'product':78
                'price':'19.00'
                'providers':['8', '11']
                'ergent':True
                'prining':False
                'embroidery':True
                'comment':None
                'product_name':'חולצת פלאנל'
            '''
            p = order.products.filter(id=product['id'])
            if len(p) != 0:
                p = p.first()
            else:
                p = MOrderItem()
                p.morder.set(order)
                p.product = product['product']
                print('p1', p, 'save')
                p.save()
            p.price = product['price']
            p.providers.set(product['providers'])
            p.ergent = product['ergent']
            p.prining = product['prining']
            p.embroidery = product['embroidery']
            p.comment = product['comment']
            print('p2', p, 'save')
            p.save()
            all_es = []
            for entry in product['entries']:
                '''
                    {'id': 103, 'quantity': 0, 'color': 77, 'size': 87, 'varient': None, 'color_name': 'שחור', 'size_name': 'S', 'varient_name': ''}
                    {'id': 104, 'quantity': 0, 'color': 77, 'size': 88, 'varient': None, 'color_name': 'שחור', 'size_name': 'M', 'varient_name': ''}
                    {'id': 105, 'quantity': 4, 'color': 77, 'size': 89, 'varient': None, 'color_name': 'שחור', 'size_name': 'L', 'varient_name': ''}
                    {'id': 106, 'quantity': 4444, 'color': 77, 'size': 90, 'varient': None, 'color_name': 'שחור', 'size_name': 'XL', 'varient_name': ''}
                    {'id': 107, 'quantity': 0, 'color': 77, 'size': 91, 'varient': None, 'color_name': 'שחור', 'size_name': '2XL', 'varient_name': ''}
                    {'id': 108, 'quantity': 0, 'color': 78, 'size': 87, 'varient': None, 'color_name': 'לבן', 'size_name': 'S', 'varient_name': ''}
                    {'id': 109, 'quantity': 0, 'color': 78, 'size': 88, 'varient': None, 'color_name': 'לבן', 'size_name': 'M', 'varient_name': ''}
                    {'id': 110, 'quantity': 4, 'color': 78, 'size': 89, 'varient': None, 'color_name': 'לבן', 'size_name': 'L', 'varient_name': ''}
                    {'id': 111, 'quantity': 0, 'color': 78, 'size': 90, 'varient': None, 'color_name': 'לבן', 'size_name': 'XL', 'varient_name': ''}
                    {'id': 112, 'quantity': 0, 'color': 78, 'size': 91, 'varient': None, 'color_name': 'לבן', 'size_name': '2XL', 'varient_name': ''}
                '''
                e = p.entries.filter(id=entry['id'])
                if len(e) != 0:
                    e = e.first()
                else:
                    e = MOrderItemEntry()
                    e.morder_item = p
                    print('e1', e, 'save')
                    e.save()
                e.quantity = entry['quantity']
                e.color_id = entry['color']
                e.size_id = entry['size']
                e.varient_id = entry['varient']
                print('e2', e, 'save')
                e.save()
        print('order', order, 'save')
        order.save()
        return JsonResponse({'status':'ok'}, status=status.HTTP_200_OK)
    #order = MOrder.objects.select_related('client',).prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient').get(id=id)#
    #order = order.select_related('client',).prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient')
    data = AdminMOrderSerializer(order).data
    return JsonResponse(data, status=status.HTTP_200_OK)