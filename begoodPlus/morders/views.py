from gettext import Catalog
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render

from catalogImages.models import CatalogImage
from .serializers import AdminMOrderItemSerializer, AdminMOrderSerializer
from morders.models import MOrder, MOrderItem, MOrderItemEntry
from rest_framework import status
import json
from rest_framework.decorators import api_view
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse

from django.template.loader import get_template

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