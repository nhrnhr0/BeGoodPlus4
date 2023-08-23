from threading import Thread
from uuid import uuid4
from core.tasks import sheetsurl_to_providers_docx_task
from docsSignature.models import MOrderSignatureSimulationConnectedItem
from docsSignature.models import MOrderSignatureSimulation
from morders.models import MorderStatus
from django.db import models
from django.db.models.functions import Length
from django.db.models.functions import Concat
from django.db.models.functions import Substr
from django.db.models import Sum, Avg, When, Case
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Q
from django.db.models import OuterRef, Subquery
from django.db.models import Count, F, Value
from ast import Return
import datetime
from gettext import Catalog
import io
import zipfile
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from matplotlib.pyplot import annotate
from docsSignature.views import save_image_to_cloudinary
from catalogImages.models import CatalogImage
# from inventory.models import PPN, WarehouseStock
from provider.models import Provider
# from smartbee.models import SmartbeeTokens
from .serializers import AdminMOrderItemSerializer, AdminMOrderListSerializer, AdminMOrderSerializer, MOrderCollectionSerializer
from morders.models import MOrder, MOrderItem, MOrderItemEntry
from rest_framework import status
import json
from rest_framework.decorators import api_view
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse
from django.db import connection, reset_queries
from django.db.models import F

from django.template.loader import get_template
# from docxtpl import DocxTemplate
from productSize.models import ProductSize
from docx.enum.table import WD_TABLE_DIRECTION
import reversion


@api_view(['GET'])
def get_all_orders(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "GET":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            data = MOrder.objects.all().prefetch_related(
                'products', 'products__entries').select_related('client', 'agent')
            serializer = AdminMOrderListSerializer(data, many=True)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)


def view_morder_pdf(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    obj = MOrder.objects.get(id=id)
    products = MOrderItem.objects.filter(morder=obj)
    products = products.select_related('product',).prefetch_related('entries',)
    html = render(request, 'morder_pdf.html', {
                  'order': obj, 'products': products})
    return HttpResponse(html)


# TODO: which one is better? and which is used?
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
        else:  # handle if varient_id is '': make it None
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
        arr = [0, 1, 2, 3, 4]
        entry_id = data.get('entry_id')
        orderObj = MOrderItem.objects.get(id=int(entry_id))
        for index in arr:
            color_id = data['color_' + str(index)]  # color_0
            size_id = data['size_' + str(index)]  # size_0
            varient_id = data['varient_' + str(index)]  # varient_0
            amount = data['amount_' + str(index)]  # amount_0
            color_id = color_id if color_id != '' and color_id != 'undefined' else None
            size_id = size_id if size_id != '' and size_id != 'undefined' else None
            varient_id = varient_id if varient_id != '' and varient_id != 'undefined' else None
            print(color_id, size_id, varient_id, amount)
            if size_id != None and color_id != None:
                objs = MOrderItemEntry.objects.filter(
                    orderItem=orderObj,
                    color_id=int(color_id) if color_id != None else None,
                    size_id=int(size_id) if size_id != None else None,
                    varient_id=int(varient_id) if varient_id != None else None,
                )
                if objs.count() == 0:
                    obj = MOrderItemEntry.objects.create(
                        color_id=int(color_id) if color_id != None else None,
                        size_id=int(size_id) if size_id != None else None,
                        varient_id=int(
                            varient_id) if varient_id != None else None,
                    )
                    obj.orderItem.set([orderObj])
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
    return render(request, 'morder_edit2.html', context=context)


def api_delete_order_data_item(request, row_id):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        if request.method != "DELETE":
            return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            try:
                obj = MOrderItem.objects.get(id=int(row_id))
                for entry in obj.entries.all():
                    entry.delete()
                obj.entries.clear()
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
            objs = MOrderItem.objects.filter(
                morder=order_id, product_id=product_id)
            print(objs)
            if objs.count() == 0:
                product = CatalogImage.objects.get(id=product_id)
                price = product.client_price
                obj = MOrderItem.objects.create(
                    product_id=product_id,
                    price=price,
                )

                # TODO: is it important to save the items inside the morder
                obj.morder.set([MOrder.objects.get(id=order_id)])
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
    from docsSignature.utils import create_signature_doc_from_morder, create_signature_doc_from_morder_thread
    print('api_get_order_data', id)
    if not request.user.is_superuser:
        return JsonResponse({'status': 'error'}, status=status.HTTP_403_FORBIDDEN)

    order = MOrder.objects.select_related('client', 'agent', 'client__user', 'mordersignature',).prefetch_related(
        'products', 'products__product__sizes', 'products__product__colors', 'products__product__varients', 'products__entries', 'products__entries__color', 'products__entries__size', 'products__entries__varient',
        'products__providers', 'products__product',).get(id=id)
    if request.method == 'POST':
        with reversion.create_revision():
            data = json.loads(request.body)
            # order.status = data['status']
            new_status = None
            if data['status2']:
                new_status = MorderStatus.objects.get(id=data['status2'])
            order.message = data['message']
            order.email = data['email']
            order.name = data['name']
            order.phone = data['phone']
            order.status_msg = data['status_msg']
            # order.export_to_suppliers = data.get('export_to_suppliers', False)
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
                    p.save()
                p.price = product['price']
                p.providers.set(product['providers'])
                p.ergent = product['ergent']
                if p.ergent == 'false':
                    p.ergent = False
                elif p.ergent == 'true':
                    p.ergent = True
                p.prining = product['prining']
                p.embroidery = product['embroidery']
                p.embroideryComment = product.get('embroideryComment', '')
                p.priningComment = product.get('priningComment', '')
                p.comment = product['comment']
                p.save()
                all_es = []
                for entry in product['entries']:
                    '''
                        {'id': 103, 'quantity': 0, 'color': 77, 'size': 87, 'varient': None,
                            'color_name': 'שחור', 'size_name': 'S', 'varient_name': ''}
                        {'id': 104, 'quantity': 0, 'color': 77, 'size': 88, 'varient': None,
                            'color_name': 'שחור', 'size_name': 'M', 'varient_name': ''}
                        {'id': 105, 'quantity': 4, 'color': 77, 'size': 89, 'varient': None,
                            'color_name': 'שחור', 'size_name': 'L', 'varient_name': ''}
                        {'id': 106, 'quantity': 4444, 'color': 77, 'size': 90, 'varient': None,
                            'color_name': 'שחור', 'size_name': 'XL', 'varient_name': ''}
                        {'id': 107, 'quantity': 0, 'color': 77, 'size': 91, 'varient': None,
                            'color_name': 'שחור', 'size_name': '2XL', 'varient_name': ''}
                        {'id': 108, 'quantity': 0, 'color': 78, 'size': 87, 'varient': None,
                            'color_name': 'לבן', 'size_name': 'S', 'varient_name': ''}
                        {'id': 109, 'quantity': 0, 'color': 78, 'size': 88, 'varient': None,
                            'color_name': 'לבן', 'size_name': 'M', 'varient_name': ''}
                        {'id': 110, 'quantity': 4, 'color': 78, 'size': 89, 'varient': None,
                            'color_name': 'לבן', 'size_name': 'L', 'varient_name': ''}
                        {'id': 111, 'quantity': 0, 'color': 78, 'size': 90, 'varient': None,
                            'color_name': 'לבן', 'size_name': 'XL', 'varient_name': ''}
                        {'id': 112, 'quantity': 0, 'color': 78, 'size': 91, 'varient': None,
                            'color_name': 'לבן', 'size_name': '2XL', 'varient_name': ''}
                    '''
                    e = p.entries.filter(id=entry['id'])
                    qyt = entry.get('quantity', '')
                    qyt = int(qyt) if qyt != "" else 0

                    if len(e) != 0:
                        e = e.first()
                        # e.color_id = entry['color']
                        # e.size_id = entry['size']
                        # e.varient_id = entry.get('varient', None)
                        if qyt > 0:
                            e.quantity = qyt
                            e.save()
                            # dups = p.entries.filter(
                            #     Q(color=e.color) and
                            #     Q(size=e.size) and
                            #     Q(varient=e.varient) and
                            #     Q(morder_item=p) and
                            #     ~Q(id=e.id)
                            # )
                            # if dups.count() != 0:
                            #     print('delete all dups: ', dups)
                            #     dups.delete()
                        else:
                            e.delete()
                            pass
                    else:
                        if qyt > 0:
                            existing_entry = p.entries.filter(
                                color_id=entry['color'], size_id=entry['size'], varient_id=entry.get('varient', None))
                            if existing_entry.count() != 0:
                                existing_entry = existing_entry.first()
                                existing_entry.quantity = qyt
                                existing_entry.save()
                            else:
                                e = MOrderItemEntry(
                                    quantity=qyt, color_id=entry['color'], size_id=entry['size'], varient_id=entry.get('varient', None))
                                e.morder_item = p
                                e.save()
                                p.entries.add(e)
                    # e.

                    # print('e2', e, 'save')
                    p.save()
            print('done saving order items, move to simulations')
            for sim in data['simulations']:
                if sim.get('deleted'):
                    if sim.get('id'):
                        try:
                            sim_to_delete = MOrderSignatureSimulation.objects.get(
                                id=sim['id'])
                            sim_to_delete.delete()
                        except:
                            pass
                    continue
                if sim.get('id') != None:
                    sim_obj = MOrderSignatureSimulation.objects.get(
                        id=sim['id'])
                else:
                    try:
                        sigModal = order.mordersignature
                    except:

                        create_signature_doc_from_morder(order)
                        sigModal = order.mordersignature
                    sim_obj = MOrderSignatureSimulation.objects.create()
                    sim_obj.save()
                    sigModal.simulations.add(sim_obj)
                sim_obj.description = sim.get('description', '')
                sim_obj.order = sim.get('order', 1)
                if sim.get('cimage') and sim['cimage'].startswith('data:image'):
                    # image data;str
                    image_data = sim['cimage']
                    # save the image to cloudinary and get the url
                    url = save_image_to_cloudinary(
                        image_data, str(sim_obj.id) + str(uuid4()), 'simulations')
                    # update the item's cimage field
                    sim_obj.cimage = url

                # iterate over the products and save them
                # sim.products = {product['id']: {'amount': Int}...]
                # sim.products = {MOrderItem: {'amount': Int},...]
                keys = sim.get('products', {}).keys()
                for key in keys:
                    obj = MOrderItem.objects.get(id=key)
                    amount = sim['products'][key]['amount']
                    # if exists update
                    # sim_obj.products.all().item.id
                    try:
                        item = sim_obj.products.get(item__id=key)
                        item.amount = amount
                        item.save()
                    except:
                        new_obj = MOrderSignatureSimulationConnectedItem.objects.create(
                            item=obj, amount=amount)
                        sim_obj.products.add(
                            new_obj)

                sim_obj.save()
                pass
            print('done saving simulations')
            if new_status:
                order.status2 = new_status

            # recalculate total price
            try:
                order.recalculate_total_price()
                order.notify_order_status_update()
                order.save()
                create_signature_doc_from_morder_thread(order)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)

            print('done saving order')
            # _ord = MOrder.objects.get(id=order.id)
            # total_price = 0
            # for item in _ord.products.all():
            #     totalEntriesQuantity = sum(
            #         [entry.quantity for entry in item.entries.all()])
            #     total_price += totalEntriesQuantity * item.price
            # _ord.total_sell_price = total_price
            # _ord.save()

            user = request.user._wrapped if hasattr(
                request.user, '_wrapped') else request.user
            reversion.set_user(user)
            reversion.set_comment(
                'סטטוס: ' + str(order.status2.name) + ' - סה"כ: ' + str(order.total_sell_price) + '₪')
            print('done saving order revisions, send to spreadsheet')
            print('done sending to spreadsheet thread')

        return JsonResponse({'status': 'ok'}, status=status.HTTP_200_OK)

    data = AdminMOrderSerializer(order).data
    return JsonResponse(data, status=status.HTTP_200_OK)
