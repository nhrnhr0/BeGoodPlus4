from docx.shared import Inches, Cm
from morders.models import MOrder
from distutils.debug import DEBUG
import zipfile
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from morders.views import create_providers_docx
from productSize.models import ProductSize
from .forms import FormBeseContactInformation
import requests
from cmath import isnan
from begoodPlus.secrects import SMARTBEE_DOMAIN, SMARTBEE_providerUserToken

from smartbee.models import SmartbeeResults, SmartbeeTokens
from catalogImages.views import SearchProductSerializer
from .models import UserSearchData
from django.db.models import Value, CharField
from itertools import chain
from .serializers import SearchCatalogImageSerializer, SearchCatalogAlbumSerializer
import json
from .models import Customer, BeseContactInformation
from django.contrib.contenttypes.models import ContentType
import time
from .tasks import product_photo_send_notification, send_cantacts_notificatios, send_cart_notification, send_question_notification, test, turn_to_morder_task
import xlsxwriter
import io
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.conf import settings
import uuid
from django.views.decorators.csrf import ensure_csrf_cookie
from catalogAlbum.serializers import CatalogImageSerializer
from catalogAlbum.models import CatalogAlbum, CatalogImage
import json
from django.db.models import Q
from django.contrib.auth import logout
from decimal import Decimal
import celery
import datetime
from django.shortcuts import render, redirect, HttpResponse
from django.http import JsonResponse
from django.db.models.functions import Greatest
from django.contrib.postgres.search import TrigramSimilarity
from rest_framework.permissions import AllowAny, IsAuthenticated
from campains.views import get_user_campains_serializer_data
from client.models import UserQuestion
from rest_framework.decorators import authentication_classes
from client.views import get_user_info
from clientApi.serializers import ImageClientApi
from .models import ActiveCartTracker, SvelteCartModal, SvelteCartProductEntery, SvelteContactFormModal, UserSearchData
from django.urls import reverse
from core.models import UserProductPhoto
# Create your views here.
from django.contrib import messages
import os
from docx import Document
from docx.shared import Inches
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.table import WD_TABLE_DIRECTION

from docx.shared import Pt


def admin_upload_docs_page(request):
    return render(request, 'adminUploadDocs.html', context={})


'''
info = {
            "providerUserToken": SMARTBEE_providerUserToken,
            "providerMsgId": datetime.datetime.now().strftime("%Y%m%d%H%M%S"),
            "providerMsgReferenceId": "something 123456",
            "customer":{
                'providerCustomerId': self.client.user.id if self.client else None,
                'name': self.name,
                # 'email': self.email,
                # 'mainPhone': self.phone,
                'dealerNumber': self.client.privateCompany if self.client else None,
                'netEOM': 30,
            },
            "docType": "Invoice",
            "createDraftOnFailure": True,
            "dueDate": self.updated.strftime("%Y-%m-%d"),
            "title": 'הזמנה מספר ' + str(self.id),
            "extraCommentsForEmail": "",
            "currency": {
                "currencyType": "ILS",
                "rate": 0
            },
            "documentItems": {
                "paymentItems": list(vals),
                "discount": {
                    "discountValueType": "Percentage",
                    "value": 0
                },
                "roundTotalSum": True
            },
            "isSendOrigEng": False,
            "docDate": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00"),
        }
'''


def get_smartbee_info_from_dfs(client_info, items_table, sheet_name, docType):
    morder_id = client_info['מספר הזמנה'][0]
    db_morder = MOrder.objects.get(id=morder_id)
    db_client = db_morder.client
    dealerNumber = db_client.privateCompany if db_client else '0'
    providerCustomerId = str(uuid.uuid4()).replace('-', '')
    name = 'morder (' + str(db_morder.id) + ')'
    if(len(name) < 2):
        name = 'name'

    continue_add_amounts = False
    product_name = ''
    res_products = []
    price = ''
    barcode = ''
    last_row_was_a_header = False
    for idx, row in items_table.iterrows():
        # print(row)
        # are we on a main row?
        if not pd.isna(row['רקמה?']):
            if(product_name != ''):
                print('product_name: ', product_name)
                product_obj = CatalogImage.objects.filter(
                    title=product_name).first()
                barcode = row['ברקוד'] if not pd.isna(row['ברקוד']) else ''
                res_products.append({
                    'product_obj': product_obj,
                    'product_name': product_name,
                    'amount_taken': amount_taken,
                    'include_tax': includeTaxBool,
                    'barcode': barcode,
                    'price': price,
                })
                continue_add_amounts = False
            product_name = row['פריט']
            amount_taken = row['כמות נלקחת']
            if pd.isna(amount_taken):
                amount_taken = 0
                continue_add_amounts = True
            else:
                if str(amount_taken).lower() == 'v':
                    amount_taken = row['כמות כוללת']

            includeTax = row['מע"מ']
            if includeTax == 'כולל':
                includeTaxBool = True
            else:
                includeTaxBool = False
            last_row_was_a_header = True

            price = row['מחיר מכירה']
        # are we on a sizes colors table
        else:
            if last_row_was_a_header:
                amount_taken = 0
                continue_add_amounts = True
            if continue_add_amounts:
                amount_taken_temp = row['כמות נלקחת']
                if str(amount_taken_temp).lower() == 'v':
                    amount_taken_temp = row['הערות']
                if not pd.isna(amount_taken_temp):
                    amount_taken += amount_taken_temp
            last_row_was_a_header = False

    product_obj = CatalogImage.objects.filter(title=product_name).first()
    res_products.append({
        'product_obj': product_obj,
        'product_name': product_name,
        'amount_taken': amount_taken,
        'include_tax': includeTaxBool,
        'barcode': barcode,
        'price': price,
    })

    paymentItems = []
    for prod in res_products:
        description = prod['product_name']
        if prod['barcode']:
            description += ' (' + str(prod['barcode']) + ')'
        entry = {
            "providerItemId": prod['product_name'],
            "quantity": prod['amount_taken'],
            "pricePerUnit": prod['price'].replace('₪', ''),
            "vatOption": "Include" if prod['include_tax'] else "NotInclude",
            "description":  description,
        }
        paymentItems.append(entry)

    customer_details = {
        "providerUserToken": SMARTBEE_providerUserToken,
        "providerMsgId": str(datetime.datetime.now().strftime("%Y%m%d%H%M%S")),
        "providerMsgReferenceId": "something 123456",
        "customer": {
            'providerCustomerId': providerCustomerId,
            'name': name,
            # 'email': self.email,
            # 'mainPhone': self.phone,
            'dealerNumber': dealerNumber,
            'netEOM': 30,
        },
        "docType": docType,
        "createDraftOnFailure": True,
        "dueDate": db_morder.updated.strftime("%Y-%m-%d"),
        "title": 'הזמנה מספר ' + str(db_morder.id),
        "extraCommentsForEmail": "",
        "currency": {
            "currencyType": "ILS",
            "rate": 0
        },

        "documentItems": {
            "paymentItems": paymentItems,
            "discount": {
                "discountValueType": "Percentage",
                "value": 0
            },
            "roundTotalSum": True
        },
        "isSendOrigEng": False,
        "docDate": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00"),
    }

    return customer_details


def process_exel_to_providers_docx(file):
    all_sheets = pd.ExcelFile(file)
    # get the sheets named 'Sheet'
    sheet = all_sheets.parse(sheet_name='Sheet')

    # sheets_names = all_sheets.sheet_names exept 'Sheet'
    sheets_names = all_sheets.sheet_names
    sheets_names.remove('Sheet')
    # iterate over the rows
    pink_data = None
    data = {}
    for idx, row in sheet.iterrows():
        # get value in vloumn 'כמות כוללת'
        is_header = row['האם שורה ראשית']
        # if there is a value in the cell, then it's a pink row (header)
        if not pd.isna(is_header):
            if pink_data != None:
                if len(data[provider_name]['products'][product_name]['items']) == 0:
                    data[provider_name]['products'][product_name]['items'].append({
                        'size': 'ONE SIZE',
                        'color': 'ON COLOR',
                        'verient': '',
                        'qty': pink_data['new_amount'],
                    })

            amount = row['כמות כוללת']
            provider_name = row['ספק']
            if pd.isna(provider_name):
                provider_name = 'ספק ריק'
            new_amount = row['כמות חדשה לספקים']
            if pd.isna(new_amount):
                new_amount = row['כמות כוללת']
                is_new_amount_header_set = False
            else:
                is_new_amount_header_set = True
            product_name = row['פריט']
            pink_data = {
                'provider_name': provider_name,
                'new_amount': new_amount,
                'product_name': product_name,
                'is_new_amount_header_set': is_new_amount_header_set,
            }
            if provider_name not in data:
                data[provider_name] = {}
            if not 'products' in data[provider_name]:
                data[provider_name]['products'] = {}
            if product_name not in data[provider_name]:
                data[provider_name]['products'][product_name] = {
                    'items': []
                }

        else:
            # if there is no value in the cell, then it's a item row item
            if pink_data:
                if pink_data['is_new_amount_header_set']:
                    continue
                else:
                    # amount = row['כמות חדשה לספקים']
                    # if pd.isna(amount):
                    #     amount = row['הערות']
                    _provider_name = row['ספק']
                    if pd.isna(_provider_name):
                        _provider_name = provider_name
                    if _provider_name not in data:
                        data[_provider_name] = {
                            'provider_name': _provider_name,
                            'new_amount': 0,
                            'product_name': pink_data['product_name'],
                            'is_new_amount_header_set': False,
                        }
                    if 'products' not in data[_provider_name]:
                        data[_provider_name]['products'] = {}

                    if product_name not in data[_provider_name]['products']:
                        data[_provider_name]['products'][product_name] = {
                            'items': []
                        }

                        # data[_provider_name][product_name] = {
                        #     'items': []
                        # }
                    cell_qyt = row['כמות חדשה לספקים']
                    if pd.isna(cell_qyt):
                        cell_qyt = row['הערות']
                    data[_provider_name]['products'][product_name]['items'].append({
                        'size': row['פריט'],
                        'color': row['ברקוד'],
                        'verient': row['כמות כוללת'],
                        'qty': cell_qyt,
                    })

                    # pink_data['items'].append({
                    #     'size': row['גודל'],
                    #     'color': row['צבע'],
                    #     'amount': row['כמות כוללת'],
                    # })
            else:
                pass
    return {
        'data': data,
        'sheets_names': sheets_names,
    }


def add_table_to_doc(document, data):
    # , style="ColorfulList-Accent5"
    # First row are table headers!
    # https://github.com/python-openxml/python-docx/issues/149
    table = document.add_table(
        rows=(data.shape[0]+1), cols=data.shape[1], style="Light Shading")  #
    table.autofit = True
    table.allow_autofit = True

    # widths = (Inches(3), Inches(3),)
    # for row in table.rows:
    #     for idx, width in enumerate(widths):
    #         row.cells[idx].width = width
    table.direction = WD_TABLE_DIRECTION.LTR
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # first row is the headers (column names)
    for j in range(data.shape[-1]):
        table.cell(
            0, data.shape[-1] - j - 1).text = data.columns[j]
        table.cell(
            0, data.shape[-1] - j - 1).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    # data rows
    for i in range(data.shape[0]):
        for j in range(data.shape[-1]):
            txt = str(data.values[data.shape[0] -
                                  i - 1, data.shape[-1] - j - 1])
            if txt == 'nan' or txt == '0' or txt == 'ON COLOR' or txt == '0.0':
                txt = ''
            table.cell(i + 1,
                       j).text = txt.replace('.0', '')
            table.cell(i + 1,
                       j).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            # if it's the last 3 columns, then align right
            if j >= data.shape[-1] - 3:
                table.cell(i + 1,
                           j).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT

    # for i, column in enumerate(data):
    #     for row in range(data.shape[0]):
    #         table.cell(row, i).text = str(data[column][row])
    # for cell in table.columns[0].cells:
    #     cell.width = Inches(0.5)
    table.columns[len(table.columns) - 1].width = Inches(1.5)
    if (len(table.columns) > 2):
        table.columns[len(table.columns) - 2].width = Inches(0.95)
        table.columns[len(table.columns) - 3].width = Inches(0.95)
    # align center
    table.columns[len(table.columns) - 1].alignment = WD_TABLE_ALIGNMENT.RIGHT
    #table.rows[0].cells[0].width = Inches(5.0)
    return table


def generate_provider_docx(provider_data, provider_name):
    pd.option_context('expand_frame_repr', False, 'display.max_rows', None)
    document = Document()

    today = datetime.datetime.now()
    date_time = today.strftime("%d/%m/%Y")
    end_file_location = 'static_cdn' if settings.DEBUG else 'static'
    end_file_location = end_file_location + \
        '/assets/images/provider_docx_header.png'
    file_location = os.path.join(
        settings.BASE_DIR, end_file_location)

    document.add_picture(file_location, width=Cm(21.5 - 0.75*2))
    entries = []
    _last_product_name = ''
    try:
        for product_name, product_data in provider_data['products'].items():
            _last_product_name = product_name
            print(product_name)
            for item in product_data['items']:
                entries.append({
                    'מוצר': product_name,
                    'מידה': 'ONE SIZE' if item['size'] == 'one size' else item['size'],
                    'צבע': item['color'],
                    'מודל': item['verient'],
                    'כמות': item['qty'],
                })
    except Exception as e:
        return _last_product_name
    # document = Document()
    # crete pivot table
    indexs = ['מוצר', 'מודל', 'צבע']
    column = 'מידה'
    value = 'כמות'
    df = pd.DataFrame(entries)
    df = df.fillna(0)
    df = df.pivot_table(index=indexs, columns=[column],
                        values=value, aggfunc='sum')
    df = df.fillna(0)
    df = df.astype(int)
    df = df.reset_index()

    options = ProductSize.objects.all().order_by(
        'code').values_list('size', flat=True)
    opt1 = ['XS', 'S',
            'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
    opt2 = ['36', '37', '38', '39',
            '40', '41', '42', '43', '44', '45', '46', '47', '48']
    opt3 = ['ONE SIZE']
    # opt4 = 2-18 (in tows)
    opt4 = ['2', '4', '6', '8', '10', '12', '14', '16', '18']
    # opt5 = 36-54 (in tows)
    opt5 = ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54']
    # opt3 = ['מוצר', 'צבע', 'מודל', + all options exept what is in opt1 and opt2]
    opt6 = []
    for option in options:
        if option not in opt1 and option not in opt2 and option not in opt3 and option not in opt4 and option not in opt5:
            opt6.append(option)
    all_options = [opt1, opt2, opt3, opt4, opt5, opt6]
    # df = find for each product (מוצר) the best option to be used as the columns names (מידה)
    # for example if the product has only XS and S then the option will be opt1
    # if the product has only 36 and 37 then the option will be opt2
    # if the product has only ONE SIZE then the option will be opt3
    # if the product has only 2 and 4 then the option will be opt4
    # if the product has only 36 and 38 then the option will be opt2
    # if the product has only 36 and 38 and 50 then the option will be opt5
    # if the product has only 36 and 38 and 50 and 52 then the option will be opt5
    # code:
    tables = []
    options_dfs = {}
    for index, row in df.iterrows():
        # print(row)
        product_name = row['מוצר']
        # itate over all options and find the best one
        best_option = None
        best_option_len = 0
        best_option_idx = -1
        curr_option_idx = 0
        for option in all_options:
            found = 0

            indexs = row.index.to_list()
            indexs = list(filter(lambda x: x not in [
                'מוצר', 'מודל', 'צבע'], indexs))
            for size in option:
                if size in indexs and row.get(size) > 0:
                    found += 1
            if found > best_option_len:
                best_option_len = found
                best_option = option
                best_option_idx = curr_option_idx
            curr_option_idx += 1
        # create new df with the best option
        if options_dfs.get(best_option_idx) is None:
            options_dfs[best_option_idx] = pd.DataFrame()
        print(product_name, best_option)
        d = {
            'מוצר': product_name,
            'מודל': row['מודל'],
            'צבע': row['צבע'],
            **{size: row.get('ONE SIZE' if size == 'one size' else size, '') for size in best_option}
        }
        options_dfs[best_option_idx] = options_dfs[best_option_idx].append(
            d, ignore_index=True)
    # base = ['מוצר', 'צבע', 'מודל']

    # opt1 = base + opt1[:: -1]
    # opt2 = base + opt2[:: -1]
    # t1 = df.reindex(labels=opt1, axis=1)
    # t2 = df.reindex(labels=opt2, axis=1)

    # #
    # t3 = df.reindex(labels=['מוצר', 'צבע', 'מודל', 'ONE SIZE'], axis=1)
    # add to t3 all what is in df that is not in t1 and t2

    rtlstyle = document.styles.add_style('rtl', WD_STYLE_TYPE.PARAGRAPH)
    rtlstyle.font.rtl = True
    p = document.add_heading(
        'לכבוד: ' + provider_name + ' \t\t תאריך: ' + date_time, level=1)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    #t1.dropna(axis=1, how='all', inplace=True)
    # if not t1.dropna(axis=1, how='all').empty:
    #     document.add_heading('טבלת ביגוד', level=2)
    #     add_table_to_doc(document, t1.dropna(axis=0, how='all'))
    # if not t2.dropna(axis=1, how='all').empty:
    #     document.add_heading('טבלת נעליים', level=2)
    #     add_table_to_doc(document, t2.dropna(axis=0, how='all'))
    # if not t3.dropna(axis=1, how='all').empty:
    #     document.add_heading('טבלת כלים', level=2)
    #     add_table_to_doc(document, t3.dropna(axis=0, how='all'))
    for key, value in options_dfs.items():
        if not value.dropna(axis=1, how='all').empty:
            cols = all_options[key][0]
            if key == 0:
                label = 'טבלת ביגוד'
            elif key == 1:
                label = 'טבלת נעליים'
            elif key == 2:
                label = 'טבלת כלים'
            elif key == 3:
                label = 'טבלת ילדים'
            elif key == 4:
                label = 'טבלת מכנסיים'
            else:
                label = 'טבלה'
            cols = value.columns.to_list()
            # remove 'מוצר', 'מודל', 'צבע' from cols
            cols = list(filter(lambda x: x not in [
                'מוצר', 'מודל', 'צבע'], cols))
            # iterate over all cols and remove all rows that have 0 in all cols from the start and the end but not in the middle
            cols.sort(
                key=lambda x: ProductSize.objects.get(size=x).code)
            to_remove = []
            for col in cols:
                if value[col].sum() == 0 or value[col].sum() == '':
                    to_remove.append(col)
                else:
                    break
            for col in reversed(cols):
                if value[col].sum() == 0 or value[col].sum() == '':
                    to_remove.append(col)
                else:
                    break
            for col in to_remove:
                value.drop(col, axis=1, inplace=True)
                cols.remove(col)

            # add title with the label in the center
            p = document.add_heading(label, level=2)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

            base = ['מוצר', 'צבע', 'מודל']
            # if 'ONE SIZE' in value.columns:
            #     base = ['מוצר', ]
            lbls = base + cols[::-1]  # all_options[key][:: -1]
            value = value.reindex(labels=lbls, axis=1)
            # if all the col of מודל are empty strings then remove the col
            models = pd.Series(value.get('מודל'), dtype='str').str.strip()
            found_model = False
            for m in models:
                if m != '' and m != 'nan' and m != '0' and m != 'None' and m != '0.0':
                    found_model = True
                    break
            if not found_model:
                try:
                    value = value.drop('מודל', axis=1)
                except:
                    pass

            add_table_to_doc(document, value.dropna(axis=0, how='all'))
    # changing the page margins
    margin = 1
    sections = document.sections
    for section in sections:
        section.top_margin = Cm(margin)
        section.bottom_margin = Cm(margin)
        section.left_margin = Cm(margin)
        section.right_margin = Cm(margin)
    return document


def exel_to_providers_docx(request):
    if request.user.is_authenticated and request.user.is_superuser:
        if(request.method == "POST"):
            # print(request.FILES)
            file = request.FILES.get('file', None)
            if file:
                info = process_exel_to_providers_docx(file)
                data = info['data']
                client_names = list(map(lambda x: x.split(' ')[
                    -1], info['sheets_names']))
                # iterate the keys (provider_names) and generate_provider_docx for each
                #docs = []
                docs_data = []
                for provider_name in data.keys():
                    doc = generate_provider_docx(
                        data[provider_name], provider_name)
                    # if doc is string then there was an error
                    if type(doc) == str:
                        return JsonResponse({'error': {
                            'provider_name': provider_name,
                            'product_name': doc
                        }})
                    # docs.append(doc)
                    docs_data.append({
                        'doc': doc,
                        'provider_name': provider_name,
                    })
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
                    for doc_info in docs_data:
                        file_stream = io.BytesIO()
                        doc = doc_info['doc']
                        doc.save(file_stream)
                        file_name = str(
                            '(' + doc_info['provider_name'] + ') ' + '|'.join(client_names)) + '.docx'
                        file_stream.seek(0)
                        zip_file.writestr(
                            file_name, file_stream.getvalue())
                zip_buffer.seek(0)
                response = HttpResponse(
                    zip_buffer.read(), content_type="application/zip")
                response['Content-Disposition'] = 'attachment; filename="products.zip"'
                return response

            else:
                messages.add_message(request, messages.ERROR, 'נא להוסיף קובץ')
        else:
            messages.add_message(request, messages.ERROR,
                                 'קריאה צריכה להיות POST')
    return redirect('/admin/morders/morder/')


def submit_exel_to_smartbee(request):
    if request.user.is_authenticated and request.user.is_superuser:
        if(request.method == "POST"):
            file = request.FILES.get('file', None)
            if file:
                all_sheets = pd.ExcelFile(file)
                docType = request.POST.get('docType')
                for sheets_name in all_sheets.sheet_names:
                    if sheets_name == 'Sheet':
                        continue
                    # sheet = all_sheets[sheets_name]
                    order_id = sheets_name.split(' ')[-1]
                    df = all_sheets.parse(sheet_name=sheets_name)
                    df2 = all_sheets.parse(
                        sheet_name=sheets_name, skiprows=2, )
                    info = get_smartbee_info_from_dfs(
                        df, df2, sheets_name, docType)
                    send_smartbe_info(info=info, morder_id=int(
                        order_id))  # TODO: rmeove this
                    # return JsonResponse(info, safe=False)

            else:
                messages.add_message(request, messages.ERROR, 'נא להוסיף קובץ')

        return redirect('/admin/morders/morder/')


def send_smartbe_info(info, morder_id):
    smartbee_auth = SmartbeeTokens.get_or_create_token()
    headers = {"Authorization": "Bearer " + smartbee_auth.token}
    smartbee_response = requests.post(
        SMARTBEE_DOMAIN + '/api/v1/documents/create', json=info, headers=headers)
    if smartbee_response.status_code == 200:
        # self.isOrder = True
        # self.save()
        data = smartbee_response.json()
        resultId = info['providerMsgId']
        obj = SmartbeeResults.objects.create(morder_id=morder_id,
                                             resultCodeId=data['resultCodeId'],
                                             result=data['result'],
                                             validationErrors=data['validationErrors'],
                                             resultId=resultId)
        print(data)
        return obj
    else:
        print(smartbee_response)
        print(smartbee_response.json())


'''
def json_user_tasks(customer):
    contacts_qs = customer.contact.filter(sumbited=False)
    contacts_task = UserTasksSerializer(contacts_qs, many=True)
    # print(contacts_task.data)

    return {'status':'ok','data':contacts_task.data}
def user_tasks(request):
    customer,customer_created  = Customer.objects.get_or_create(
        device=request.COOKIES['device'])
    return JsonResponse(json_user_tasks(customer))


# TODO: unused, can be deleted
def admin_subscribe_view(request):
    webpush = {"group": 'admin' }
    return render(request, 'adminSubscribe.html',{"webpush":webpush})


def mainView(request, *args, **kwargs):
    return render(request, 'newMain.html', {})
'''
'''
def saveBaseContactFormView(request,next, *args, **kwargs):
    if request.method == "POST":
        form = FormBeseContactInformation(request.POST)
        if form.is_valid():
            form.save()
            print('saveBaseContactFormView')

    return redirect(next)
'''


@ api_view(['POST', 'GET'])
@ ensure_csrf_cookie
def set_csrf_token(request, factory_id=None):
    print('factory_id: ', factory_id)
    print('device: ', request.COOKIES.get('device'))
    """
    This will be `/api/set-csrf-cookie/` on `urls.py`
    """
    if factory_id:
        try:
            uid = str(uuid.uuid4(factory_id))
        except:
            uid = str(uuid.uuid4())
    else:
        uid = str(uuid.uuid4())
    return JsonResponse({"details": "CSRF cookie set",
                         'uid': uid,
                         'whoAmI': get_user_info(request.user), }, safe=False)
    # 'campains': get_user_campains_serializer_data(request.user),}, safe=False)


@ api_view(['POST'])
@ permission_classes((AllowAny,))
def svelte_contact_form(request):
    if request.method == "POST":
        try:
            print(request.user)
            body_unicode = request.data  # .decode('utf-8')
            device = request.COOKIES.get('device')
            body = body_unicode  # json.loads(body_unicode)
            name = body['name'] or ''
            email = body['email'] or ''
            phone = body['phone'] or ''
            message = body['message'] or ''
            uuid = body['uuid'] or ''
            if(request.user.is_anonymous):
                user = None
            else:
                user = request.user
            data = SvelteContactFormModal.objects.create(
                user=user, device=device, uid=uuid, name=name, phone=phone, email=email, message=message)
            data.save()
            if(settings.DEBUG):
                send_cantacts_notificatios(data.id)
            else:
                send_cantacts_notificatios.delay(data.id)
            return JsonResponse({
                'status': 'success',
                'detail': 'form sent successfuly'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'warning',
                'detail': str(e),
            })


@ api_view(['POST'])
@ permission_classes((AllowAny,))
def track_cart(request):
    body_unicode = request.data
    device = request.COOKIES.get('device')
    active_cart_id = body_unicode.get('active_cart_id')
    if active_cart_id == None:
        active_cart_id = str(uuid.uuid4().hex)
    obj, is_created = ActiveCartTracker.objects.get_or_create(
        active_cart_id=active_cart_id)
    print('track_cart', obj, is_created)
    obj.last_ip = device
    obj.data = body_unicode
    obj.save()
    response = HttpResponse(json.dumps(
        {'status': 'ok', 'active_cart_id': active_cart_id}), content_type='application/json')
    # response.set_cookie('active_cart', active_cart_id, max_age=60*60*24*365*10, httponly=True)
    return response


@ api_view(['POST'])
@ permission_classes((AllowAny,))
def send_product_photo(request):
    data = request.data
    print(data)
    buy_price = data.get('buy_price', '')
    want_price = data.get('want_price', '')
    description = data.get('description', '')
    dzero = Decimal(0)
    if buy_price == '':
        buy_price = dzero
    if want_price == '':
        want_price = dzero
    file = data.get('file', None)
    if request.user.is_anonymous:
        user = None
    else:
        user = request.user
    obj = UserProductPhoto.objects.create(
        user=user, photo=file, buy_price=buy_price, description=description, want_price=want_price)
    print(obj)
    if(settings.DEBUG):
        product_photo_send_notification(obj.id)
    else:
        product_photo_send_notification.delay(obj.id)
    # product_photo_send_notification(obj.id)
    return JsonResponse({
        'status': 'success',
        'detail': 'form sent successfuly'
    })


@ api_view(['POST'])
@ permission_classes((AllowAny,))
def client_product_question(request):
    print('client_product_question start')
    body = request.data
    device = request.COOKIES.get('device')
    print('client_product_question', body)
    product_id = body.get('product_id', None)
    question = body.get('question', None)
    if(request.user.is_anonymous):
        user = None
        buissnes_name = body.get('buissnes_name', None)
        phone = body.get('phone', None)
        email = body.get('email', None)
        name = body.get('name', None)

    else:
        user = request.user
        if user.client:
            buissnes_name = user.client.businessName
            phone = None
            email = user.client.email
            name = user.username
        else:
            buissnes_name = None
            phone = None
            email = None
            name = None
    data = UserQuestion.objects.create(
        product=CatalogImage.objects.get(id=product_id), question=question,
        user=user, ip=device, is_answered=False, buissnes_name=buissnes_name, phone=phone, email=email, name=name)
    data.save()
    if (settings.DEBUG):
        send_question_notification(data.id)
    else:
        send_question_notification.delay(data.id)
    return JsonResponse({
        'status': 'success',
        'id': data.id,
        'detail': 'form sent successfuly'
    })


@ api_view(['POST'])
@ permission_classes((AllowAny,))
def svelte_cart_form(request):
    if request.method == "POST":
        body_unicode = request.data  # body.decode('utf-8')
        device = request.COOKIES.get('device')
        body = body_unicode  # json.loads(body_unicode)
        name = body['name'] or ''
        email = body['email'] or ''
        phone = body['phone'] or ''
        business_name = body['business_name'] or ''
        my_uuid = body['uuid'] or ''
        message = body['message'] or ''
        order_type = body['order_type'] or ''
        products = body['products'] or ''
        raw_cart = body['raw_cart'] or ''
        agent = None
        if(request.user.is_anonymous):
            user_id = None
        else:
            if (request.user.is_superuser):
                if body.get('asUser', None):
                    user_id = int(body['asUser']['id'])
                    try:
                        user_id = User.objects.get(id=user_id)
                    except User.DoesNotExist:
                        user_id = None
                else:
                    user_id = request.user
                # user_id = int(body.get('asUser') or request.user.id)
                agent = request.user
            else:
                user_id = request.user
        # check if uuid is valid

        try:
            user_uuid = uuid.UUID(my_uuid)
        except ValueError:
            user_uuid = uuid.uuid4()
        db_cart = SvelteCartModal.objects.create(user=user_id, device=device, uid=user_uuid, businessName=business_name,
                                                 name=name, phone=phone, email=email, message=message, agent=agent, order_type=order_type)
        # data.products.set(products)
        db_cart.productsRaw = raw_cart
        # products = [{'id': 5, 'amount': 145, 'mentries': {...}}, {'id': 18, 'amount': 0, 'mentries': {...}}, {'id': 138, 'amount': 0}]
        data = []
        for p in products:

            pid = p.get('id')
            pamount = p.get('amount')
            pentries = p.get('mentries', None) or {}
            if request.user.is_superuser:
                unitPrice = p.get('price')
            else:
                try:
                    user_id = request.user.id
                    cimage = CatalogImage.objects.get(id=pid)
                    price = cimage.get_user_price(user_id)
                    unitPrice = price  # cimage.client_price
                except CatalogImage.DoesNotExist:
                    unitPrice = 0
            print_desition = p.get('print', False)
            embro = p.get('embro', False)
            try:
                obj = SvelteCartProductEntery.objects.create(
                    product_id=pid, amount=pamount, details=pentries, unitPrice=unitPrice, print=print_desition, embro=embro)
                data.append(obj)
            except:
                pass
        # data = [SvelteCartProductEntery(product_id=p['id'],amount=p['amount'] or 1, details = p['mentries'] or {}) for p in products]
        # products_objs = SvelteCartProductEntery.objects.bulk_create(data)
        db_cart.productEntries.set(data)
        db_cart.save()
        if (settings.DEBUG):
            send_cart_notification(db_cart.id)
            turn_to_morder_task(db_cart.id)
            pass
        else:
            send_cart_notification.delay(db_cart.id)
            turn_to_morder_task.delay(db_cart.id)
        return JsonResponse({
            'status': 'success',
            'detail': 'form sent successfuly',
            'cart_id': db_cart.id,
            'product_ids': [p.product_id for p in data]
        })


@ api_view(['GET'])
@ permission_classes((IsAuthenticated,))
def svelte_cart_history(request):
    if request.user.is_anonymous:
        return JsonResponse({
            'status': 'warning',
            'detail': 'User is not authenticated',
        })
    previous_carts = list(
        SvelteCartModal.objects.all().filter(user_id=request.user).order_by('-created_date').values('user', 'user__username', 'name', 'businessName', 'productsRaw', 'message', 'created_date', 'agent', 'agent__client__businessName'))
    return JsonResponse(previous_carts, safe=False)


@ authentication_classes((SessionAuthentication, TokenAuthentication,))
@ api_view(['GET'])
def api_logout(request):
    if request.user.is_anonymous:
        return JsonResponse({
            'status': 'warning',
            'detail': 'User is not authenticated',
        })
    logout(request)
    response = JsonResponse({
        'status': 'success',
        'detail': 'logout successfuly'
    })
    response.delete_cookie('auth_token')
    logout(request)
    request.session.flush()
    return response


def verify_unique_field_by_field_excel(request):
    #     <input type="file" name="main_excel_file" id="main_excel_file" accept=".xlsx, .xls" required>
    #     <input type="file" name="subtract_excel_file" id="subtract_excel_file" accept=".xlsx, .xls" multiple required>
    #     <input type="text" name="unique_field" id="unique_field" required value="WhatsApp Number(with country code)">
    #     <input type="submit" id="submit-btn" value="submit">
    if request.method == "POST":
        print(request.POST)
        main_excel_file = request.FILES.get('main_excel_file', None)
        subtract_excel_file = request.FILES.getlist(
            'subtract_excel_file', None)
        unique_field = request.POST.get('unique_field', None)
        main_df = pd.read_excel(main_excel_file, dtype=str)
        subtracts_dfs = []
        for f in subtract_excel_file:
            subtracts_dfs.append(pd.read_excel(f, dtype=str))
        # remove from main df all rows that are in subtracts dfs based on colum 'unique_field'
        to_remove_numbers = []
        for df in subtracts_dfs:
            to_remove_numbers.extend(df[unique_field].tolist())

        df_data = main_df.values.tolist()
        print('len data before: ', len(df_data))
        df_data = list(
            filter(lambda x: (x[0] not in to_remove_numbers), df_data))
        # for i,val  in enumerate(df_data):
        # if val[0] in to_remove_numbers:
        # del df_data[i]
        # convert to excel to send
        print('len data after: ', len(df_data))
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()

        df_data.insert(0, ['WhatsApp Number(with country code)',
                       'First Name', 'Last Name', 'Other'])
        for i, row in enumerate(df_data):
            for j, col in enumerate(row):
                worksheet.write(i, j, col)
        workbook.close()
        output.seek(0)
        response = HttpResponse(output.read(
        ), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response['Content-Disposition'] = "attachment; filename=output.xlsx"
        return response
    return render(request, 'verify_unique_field_by_field_excel.html')


def test_celery_view(request):
    print('test_celery_view start')
    ret = test.delay(1, 2)
    print('celery done')
    return JsonResponse({'status': 'ok'})


def get_session_key(request):
    if not request.session.session_key:
        request.session.save()
    return request.session.session_key


# from .tasks import save_user_search
def convert_to_heb(txt):
    fix_txt_list = []
    heb_case = {'a': 'ש', 'b': 'נ', 'c': 'ב', 'd': 'ג', 'e': 'ק', 'f': 'כ', 'g': 'ע', 'h': 'י', 'i': 'ן', 'j': 'ח', 'k': 'ל', 'l': 'ך', 'm': 'צ', 'n': 'מ', 'o': 'ם', 'p': 'פ', 'q': '/', 'r': 'ר', 's': 'ד', 't': 'א', 'u': 'ו', 'v': 'ה', 'w': '\'', 'x': 'ס', 'y': 'ט', 'z': 'ז', ';': 'ף',
                '.': 'ץ', ',': 'ת', 'A': 'ש', 'B': 'נ', 'C': 'ב', 'D': 'ג', 'E': 'ק', 'F': 'כ', 'G': 'ע', 'H': 'י', 'I': 'ן', 'J': 'ח', 'K': 'ל', 'L': 'ך', 'M': 'צ', 'N': 'מ', 'O': 'ם', 'P': 'פ', 'Q': '/', 'R': 'ר', 'S': 'ד', 'T': 'א', 'U': 'ו', 'V': 'ה', 'W': "'", 'X': 'ס', 'Y': 'ט', 'Z': 'ז', }
    for char in txt:
        if char in heb_case:
            fix_txt_list.append(heb_case[char])
        else:
            fix_txt_list.append(char)
    return ''.join(fix_txt_list)


def autocompleteModel(request):
    start = time.time()
    # if request.is_ajax():
    q = request.GET.get('q', '')
    q2 = convert_to_heb(q)
    show_hidden = request.GET.get('show_hidden', False)

    products_qs = CatalogImage.objects.filter(
        Q(title__icontains=q) | Q(title__icontains=q2) |
        Q(albums__title__icontains=q) | Q(albums__title__icontains=q2) |
        Q(albums__keywords__icontains=q) | Q(albums__keywords__icontains=q2) |
        Q(barcode__icontains=q) | Q(barcode__icontains=q2)
    ).distinct()

    if not show_hidden:
        products_qs = products_qs.filter(Q(is_active=True) & ~Q(
            albums=None) & Q(albums__is_public=True))
    #  & (~Q(albums=None) & Q(is_active = True)
#
    # is_hidden=False
    products_qs = products_qs.prefetch_related('albums')
    ser_context = {'request': request}
    products_qs_short = products_qs[0:20]
    # products_qs_short = products_qs_short.prefetch_related(
    #     'colors', 'sizes', 'albums')
    products = SearchProductSerializer(products_qs_short, many=True, context={
        'request': request
    })
    # products = SearchCatalogImageSerializer(products_qs,context=ser_context, many=True)
    session = get_session_key(request)

    search_history = UserSearchData.objects.create(
        session=session, term=q, resultCount=products_qs.count())  # + len(mylogos.data)
    search_history.save()
    all_data = products.data  # + mylogos.data
    # all = all[0:20]
    context = {'all': all_data,
               'q': q,
               'id': search_history.id}
    print('autocompleteModel', time.time() - start)
    print('autocompleteModel', len(all_data))

    end = time.time() - start
    print('autocompleteModel: ', start-end)
    return JsonResponse(context)


def autocompleteClick(request):
    print('autocompleteClick')
    if request.method == "POST":
        id = request.POST.get('id')
        my_type = request.POST.get('value[item][data][my_type]')
        content_id = request.POST.get('value[item][data][id]')
        if my_type == 'product':
            content_type = ContentType.objects.get_for_model(CatalogImage)
            obj = CatalogImage.objects.get(pk=content_id)
        elif my_type == 'album':
            content_type = ContentType.objects.get_for_model(CatalogAlbum)
            obj = CatalogAlbum.objects.get(pk=content_id)
        # TODO: add my catalog to saved on click

        search_data = UserSearchData.objects.get(pk=id)
        search_data.content_object = obj
        search_data.save()
        context = {'status': 'ok',
                   'id': id}
        return JsonResponse(context)


def form_changed(request):
    if request.is_ajax() and request.method == 'POST':
        customer, customer_created = Customer.objects.get_or_create(
            device=request.COOKIES['device'])
        data = request.POST['content']
        data = json.loads(data)
        form_data_dict = {}
        for field in data:
            form_data_dict[field["name"]] = field["value"]

        name = form_data_dict['name']
        email = form_data_dict['email']
        phone = form_data_dict['phone']
        message = form_data_dict['message']
        formUUID = form_data_dict['formUUID']
        url = form_data_dict['url']
        sumbited = False if form_data_dict['sumbited'] == '' else True
        obj, created = BeseContactInformation.objects.get_or_create(
            formUUID=formUUID)
        # print('BeseContactInformation ', created, obj)
        obj.name = name
        obj.email = email
        obj.phone = phone
        obj.message = message
        obj.url = url
        obj.sumbited = sumbited
        obj.save()
        customer.contact.add(obj)
        customer.save()
        response = json_user_tasks(customer)
        '''
        if sumbited:
            response.redirect_to = reverse('success')
            print(response)
        print('form_changed' , response)
        return data
        '''
        if sumbited:
            response['redirect_to'] = reverse('success')
        return JsonResponse(response)
    else:
        print('why not post')


def success_view(request):
    return HttpResponse(render(request, 'success.html', context={}))


def handler404(request, *args, **argv):
    print('handler404')
    response = render(request, '404.html', {})
    response.status_code = 404
    return response


def shareable_product_view(request, prod_id):
    obj = CatalogImage.objects.get(pk=prod_id)
    return render(request, 'share_product.html', context={'obj': obj})


def shareable_category_view(request, category_id):
    obj = CatalogAlbum.objects.get(pk=category_id)
    return render(request, 'share_category.html', context={'obj': obj})
