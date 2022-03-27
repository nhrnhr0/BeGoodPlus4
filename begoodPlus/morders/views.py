from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from .serializers import AdminMOrderSerializer
from morders.models import MOrder, MOrderItem, MOrderItemEntry
from rest_framework import status
import json

# Create your views here.
def edit_morder(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'morder_edit.html', context=context)


def api_get_order_data(request, id):
    if not request.user.is_superuser:
        return JsonResponse({'status':'error'}, status=status.HTTP_403_FORBIDDEN)
    order = MOrder.objects.select_related('client',).prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient').get(id=id)
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
                p.morder = order
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
                #e.save()
                all_es.append(e)
        print('order', order, 'save')
        order.save()
        return JsonResponse({'status':'ok'}, status=status.HTTP_200_OK)
    #order = MOrder.objects.select_related('client',).prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient').get(id=id)#
    #order = order.select_related('client',).prefetch_related('products','products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient')
    data = AdminMOrderSerializer(order).data
    return JsonResponse(data, status=status.HTTP_200_OK)