from ast import Return
import datetime
from gettext import Catalog
import io
import zipfile
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from matplotlib.pyplot import annotate

from catalogImages.models import CatalogImage
from inventory.models import PPN, WarehouseStock
from provider.models import Provider
from smartbee.models import SmartbeeTokens
from .serializers import AdminMOrderItemSerializer, AdminMOrderListSerializer, AdminMOrderSerializer, AdminProviderRequestrInfoSerializer, AdminProviderRequestrSerializer, AdminProviderResuestSerializerWithMOrder, MOrderCollectionSerializer
from morders.models import CollectedInventory, MOrder, MOrderItem, MOrderItemEntry, ProviderRequest, TakenInventory
from rest_framework import status
import json
from rest_framework.decorators import api_view
from django.shortcuts import render
from io import BytesIO
from django.http import HttpResponse
from django.db import connection, reset_queries
from django.db.models import F

from django.template.loader import get_template
#from docxtpl import DocxTemplate
from productSize.models import ProductSize
from docx.enum.table import WD_TABLE_DIRECTION


def request_provider_info_admin(request, ppn_id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    ppn_obj = PPN.objects.get(id=ppn_id)
    product_id= ppn_obj.product_id
    provider_id = ppn_obj.provider_id
    obj = ProviderRequest.objects.filter(orderItem__product=product_id, provider=provider_id)
    serializer = AdminProviderRequestrInfoSerializer(obj, many=True)
    return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)


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


def provider_request_update_entry_admin(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    data = json.loads(request.body)
    print(data)
    if data.get('id', None):
        obj = ProviderRequest.objects.get(id=data['id'])
        obj.quantity = data['quantity']
    else:
        morderItem = MOrderItem.objects.get(product_id=data['product']['id'], morder=data['morder'])
        objs = ProviderRequest.objects.filter(
            provider_id=data['provider'],
            size_id=data['size'],
            varient_id=data['varient'],
            color_id=data['color'],
            force_physical_barcode=data['force_physical_barcode'],
            orderItem=morderItem
        )
        if objs.exists():
            obj = objs.first()
            obj.quantity = data['quantity']
        else:
            obj = ProviderRequest.objects.create(
                provider_id=data['provider'],
                size_id=data['size'],
                varient_id=data['varient'],
                color_id=data['color'],
                force_physical_barcode=data['force_physical_barcode'],
                quantity=data['quantity'],
            )
            obj.orderItem.add(morderItem)
        #morder = MOrder.objects.get(id=data['morder'])
        
    print(obj)
    obj.save()
    if obj.quantity <= 0:
        obj.delete()
        return JsonResponse({'status': 'Entry deleted'}, status=status.HTTP_200_OK)
    else:
        data = AdminProviderResuestSerializerWithMOrder(obj).data
        return JsonResponse({'status': 'success', 'data': data}, status=status.HTTP_200_OK)
def create_provider_docs(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'You are not authorized to perform this action'}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        ALL_SIZES = ProductSize.objects.all().values('id','size', 'code')
        # ALL_SIZES = [{'id': 1, 'size': 'S', 'code': '1'}, {'id': 2, 'size': 'M', 'code': '2'}, {'id': 3, 'size': 'L', 'code': 'L'}, {'id': 4, 'size': 'XL', 'code': '3'}, {'id': 5, 'size': 'XXL', 'code': '4'}]
        # code is the order
        # create a dictonary with key=size_size and value=code
        sizes = {}
        for size in ALL_SIZES:
            sizes[size['size']] = size['code']
        print(sizes)
        provider_requests_ids = json.loads(request.GET.get('ids'))
        objs = ProviderRequest.objects.filter(id__in=provider_requests_ids)
        print(objs)
        #orderItem__product__title =  orderItem.first()__product__title
        vals = objs.values(ספק=F('provider__name'),מוצר=F('orderItem__product__title'),מידה=F('size__size'),מודל=F('varient__name'),צבע=F('color__name',))\
                                .annotate(כמות=Sum('quantity'))\
                                .order_by('ספק','מוצר','מידה','מודל','צבע')
                
        
        
        
        
        print(vals)
        providers_split = {}
        for val in vals:
            if val['ספק'] not in providers_split:
                providers_split[val['ספק']] = {'products':[]}
            providers_split[val['ספק']]['products'].append(val)
        print(providers_split)
        for provider_name, data in providers_split.items():
            sizes_set = set()
            for product in data['products']:
                sizes_set.add(product['מידה'])
            sizes_list = list(sizes_set)
            sizes_list.sort(key=lambda x: sizes[x])
            data['sizes_list'] = sizes_list
        docs = []
        for provider_name, data in providers_split.items():
            document = create_providers_docx(data)
            docs.append({'doc': document, 'name': provider_name})

        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for doc in docs:
                file_stream = io.BytesIO()
                data = doc['doc']
                data.save(file_stream)
                file_name = doc['name'] + '.docx'
                file_stream.seek(0)
                zip_file.writestr(file_name , file_stream.getvalue())
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        response['Content-Disposition'] = 'attachment; filename="products.zip"'
        return response
        
        # create a zip file with all the docs with the name
        # provider_name_date.zip

        
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        response['Content-Disposition'] = 'attachment; filename=download.docx'
        document.save(response)
        return response


class PivotReshape():
    def __init__(self, data = list([]), index = list([]), columns= list([]), value = ''):
        self.data = data
        self.columns = columns
        self.rows = index
        self.value = value
        
    def pivot(self):
        col_keys_set = set()
        pivot_data = {}
        for idx, row_data in enumerate(self.data):
                indexies = list(map(lambda row_key: row_data.get(row_key,None), self.rows))
                indexes_hash = tuple(indexies)
                if pivot_data.get(indexes_hash, None) is None:
                    pivot_data[indexes_hash] = {
                        'cols': {},
                        'rows': {},
                        'data': {}
                    }
                    

                
                for column_key in self.columns:
                    pivot_data[indexes_hash]['cols'][row_data[column_key]] = row_data[self.value]
                    col_keys_set.add(row_data[column_key])
                for row_key in self.rows:
                    pivot_data[indexes_hash]['rows'][row_key] = row_data[row_key]
                # pivot_data[indexes_hash]['data'] = mergeing pivot_data[indexes_hash]['rows'] and pivot_data[indexes_hash]['cols']:
                pivot_data[indexes_hash]['data'] = {**pivot_data[indexes_hash]['rows'], **pivot_data[indexes_hash]['cols']}
                if pivot_data[indexes_hash].get('original_indexes', None) is None:
                    pivot_data[indexes_hash]['original_indexes'] = []
                pivot_data[indexes_hash]['original_indexes'].append({idx: row_data})
        self.pivot_data = pivot_data
        self.col_keys_list = list(col_keys_set)
        self.row_keys_list = self.rows
        return pivot_data
    

def create_providers_docx(doc_data):
        
        import os
        from django.conf import settings
        from docx import Document
        from docx.shared import Inches
        from docx.enum.style import WD_STYLE_TYPE
        from docx.enum.text import WD_ALIGN_PARAGRAPH
        import pandas as pd
        
        ALL_SIZES = ProductSize.objects.all().values('id','size', 'code')
        # ALL_SIZES = [{'id': 1, 'size': 'S', 'code': '1'}, {'id': 2, 'size': 'M', 'code': '2'}, {'id': 3, 'size': 'L', 'code': 'L'}, {'id': 4, 'size': 'XL', 'code': '3'}, {'id': 5, 'size': 'XXL', 'code': '4'}]
        # code is the order
        # create a dictonary with key=size_size and value=code
        sizes = {}
        for size in ALL_SIZES:
            sizes[size['size']] = size['code']

        # df = pd.DataFrame(doc_data['products']) 
        # df = df.pivot(index=['orderItem__product__title','varient__name', 'color__name'], columns=['size__size'], values='total_quantity')
        
        
        
        data = doc_data['products'] # [{'provider__name': 'defult provider', 'orderItem__product__title': 'חולצת דרייפיט שרוול ארוך', 'size__size': 'ONE SIZE', 'varient__name': None, 'color__name': 'שחור', 'total_quantity': 4}, {'provider__name': 'אוניברסל פרטס', 'orderItem__product__title': "בידורית 12 אינץ' power", 'size__size': '38', 'varient__name': None, 'color__name': 'no color', 'total_quantity': 10},...
        indexs = ['מוצר','מודל', 'צבע']
        column = 'מידה'
        value = 'כמות'
        pivot_table = PivotReshape(data=data, index=indexs, columns=[column], value=value)
        data = pivot_table.pivot()
        key_cols = pivot_table.col_keys_list
        key_cols.sort(key=lambda x: sizes[x])
        headers_keys = pivot_table.row_keys_list + key_cols


        document = Document()
        
        
        today = datetime.datetime.now()
        date_time = today.strftime("%d/%m/%Y")
        
        file_location = os.path.join(settings.BASE_DIR, 'static_cdn\\assets\\images\\provider_docx_header.png')
        document.add_picture(file_location, width=Inches(6))
        
        #document = Document()
        
        rtlstyle = document.styles.add_style('rtl', WD_STYLE_TYPE.PARAGRAPH)
        rtlstyle.font.rtl = True
        p = document.add_heading(date_time, level=1)
        p = document.add_heading('לכבוד: ' + 'השם שלי', level=1)
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        
        
        t = document.add_table( 1,len(headers_keys))
        header_len = len(headers_keys)
        rev_headers_keys = reversed(headers_keys)
        t.direction = WD_TABLE_DIRECTION.RTL
        header = t.rows[0].cells
        for idx, head in enumerate(rev_headers_keys):
            header[header_len - idx - 1].text = str(head)
        
        # header[0].text = 'שם מוצר'
        # header[1].text = 'מודל'
        # header[2].text = 'צבע'
        # for i in range(len(key_cols)):
        #     header[i+3].text = key_cols[i]
        
        for _, row_data in data.items():
            print(row_data)
            row = t.add_row()
            rev_headers_keys = reversed(headers_keys)
            for idx, header_key in enumerate(rev_headers_keys):
                print(row_data['data'].get(header_key, None), ' - ', header_key)
                row.cells[headers_keys.index(header_key)].text = str(row_data['data'].get(header_key, None))
        
        # t = document.add_table( 1,df.shape[1])
        # header = t.add_row().cells
        # header[df.shape[1]-1-0].text = 'שם מוצר'
        # header[df.shape[1]-1-1].text = 'צבע'
        
        # for i in range(df.shape[1]-2):
        #     header[df.shape[1]-1-i-2].text = df.columns[i]
            
        
        
        # for index, row in df.iterrows():
        #     row_cells = t.add_row().cells
        #     # row_cells[0].text = row['orderItem__product__title']
        #     # row_cells[1].text = row['color__name']
        #     # row_cells[2].text = row['size__size']
        #     for i in range(df.shape[1]):
        #         row_cells[i].text = str(row[df.shape[1]-i-1])
        #p = document.add_heading(df.to_html(), level=1)
        #p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        

        
        # add a table to the end and create a reference variable
        # extra row is so we can add the header row
        # t = document.add_table(df.shape[0]+1, df.shape[1])

        # # add the header rows.
        # for j in range(df.shape[-1]):
        #     t.cell(0,j).text = df.columns[j]

        # # add the rest of the data frame
        # for i in range(df.shape[0]):
        #     for j in range(df.shape[-1]):
        #         t.cell(i+1,j).text = str(df.values[i,j])
        # table = document.add_table(rows=1, cols=2 + len(doc_data['sizes_list']), style='Table Grid')
        # hdr_cells = table.rows[0].cells
        # hdr_cells[0].text = 'שם המוצר'
        # hdr_cells[1].text = 'צבע'
        # for i, size in enumerate(doc_data['sizes_list']):
        #     hdr_cells[2+i].text = size
        
        # for product in doc_data['products']:
        #     row_cells = table.add_row().cells
        #     row_cells[0].text = product['orderItem__product__title'] + if product['varient__name']: ' - ' + product['varient__name'] else ''
        #     row_cells[1].text = product['color__name']
            
            # row_cells[0].text = str(qty)
            # row_cells[1].text = id
            # row_cells[2].text = desc 

        #document.add_page_break()
        
        #C:/Users/ronio/Desktop/projects/BeGoodPlus4/begoodPlus
        # file_location = os.path.join(settings.BASE_DIR, 'static_cdn\\templates\\provider_template.docx')
        # doc = DocxTemplate(file_location)
        # data_table = '''<table border="1" cellspacing="0" cellpadding="0">
        #     <tr>
        #         <td>Product</td>
        #         <td>Size</td>
        #         <td>Varient</td>
        #         <td>Color</td>
        #     </tr>'''
        # context = { 'data_for' : "World company",
        #             'data_date' : date_time,
        #             'data_table' : data_table,}
        # doc.render(context)

        return document#response

def load_all_provider_request_admin(request):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    # filter only ProviderRequest.orderItem(m2m).morder(m2m).sendProviders = True
    data = ProviderRequest.objects.filter(orderItem__morder__sendProviders=True).order_by('orderItem__morder','orderItem__product',).prefetch_related('provider','orderItem__product','orderItem__morder').select_related('provider','size','varient','color')
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
    morder.subtract_collected_inventory(request.user)
    
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