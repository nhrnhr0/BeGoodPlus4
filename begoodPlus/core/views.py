import gspread
from core.gspred import get_gspread_client
from google.oauth2.credentials import Credentials
import google_auth_oauthlib
from begoodPlus.secrects import FULL_DOMAIN
from begoodPlus.secrects import SECRECT_BASE_MY_DOMAIN

from begoodPlus.secrects import GOOGLE_CLIENT_SECRET_PATH
from .utils import build_drive_service, get_drive_file, get_sheetname_from_driveurl
import re
from threading import Thread
import googleapiclient
from django.views.decorators.csrf import csrf_exempt
import numpy as np
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
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
from .models import ProvidersDocxTask, UserSearchData
from django.db.models import Value, CharField
from itertools import chain
from .serializers import SearchCatalogImageSerializer, SearchCatalogAlbumSerializer
import json
from .models import Customer, BeseContactInformation
from django.contrib.contenttypes.models import ContentType
import time
from .tasks import product_photo_send_notification, send_cantacts_notificatios, send_cart_notification, send_question_notification, sheetsurl_to_providers_docx_task, test, turn_to_morder_and_send_telegram_notification_task
import xlsxwriter
import io
import pandas as pd
import traceback

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
from django.http import HttpResponseForbidden, JsonResponse
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
from google.auth.transport.requests import Request


def clear_drive_creds(request):
    if request.user.is_authenticated and request.user.is_superuser:
        request.session['credentials'] = None
        return HttpResponse('ok')
    else:
        return HttpResponseForbidden()


def admin_upload_docs_page(request):
    if request.user.is_authenticated and request.user.is_superuser:
        return render(request, 'adminUploadDocs.html', context={})
    else:
        return redirect('/admin/login/?next=' + reverse('admin_upload_docs_page'))
    #     creds = request.session.get('credentials')
    #     if creds:
    #         credsObj = Credentials(token=creds['token'], refresh_token=creds['refresh_token'], token_uri=creds['token_uri'],
    #                                client_id=creds['client_id'], client_secret=creds['client_secret'], scopes=creds['scopes'])
    #         if credsObj.expired:
    #             credsObj.refresh(Request())
    #             request.session['credentials'] = credentials_to_dict(credsObj)
    #         if credsObj.valid and not credsObj.expired:
    #             return render(request, 'adminUploadDocs.html', context={})
    #     request.session['next'] = reverse('admin_upload_docs_page')
    #     return request_dride_auth()

    # else:
    #     return redirect('/admin/login/?next=' + reverse('admin_upload_docs_page'))


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
    try:
        if isinstance(morder_id, str):
            morder_id = int(morder_id)
        db_morder = MOrder.objects.get(id=morder_id)
        db_client = db_morder.client
        dealerNumber = db_client.privateCompany if db_client else '0'
        name = 'morder (' + str(db_morder.id) + ')'
    except:
        db_morder = None
        db_client = ''
        dealerNumber = '0'
        name = str(morder_id)
    providerCustomerId = str(uuid.uuid4()).replace('-', '')

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
        is_sub_row = pd.isna(row['רקמה?']) or row['רקמה?'] == ''
        if not is_sub_row:  # is a header row
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

            if pd.isna(amount_taken) or amount_taken == '':
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
                    # if type is str, we need to convert it to int
                    if type(amount_taken_temp) == str:
                        if amount_taken_temp == '':
                            amount_taken_temp = 0
                        else:
                            amount_taken_temp = int(amount_taken_temp)
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
    # make sure all amount_taken is int
    for product in res_products:
        if product['amount_taken'] == '':
            product['amount_taken'] = 0
        if type(product['amount_taken']) == str:
            product['amount_taken'] = int(product['amount_taken'])
    res_products = list(filter(lambda x: x['amount_taken'] > 0, res_products))
    # filter price = '' or <= 0 and remove them
    res_products = list(filter(lambda x: x['price'] != '' and float(
        x['price'].replace('₪', '')) > 0, res_products))
    paymentItems = []
    for prod in res_products:
        description = prod['product_name']
        if prod['barcode']:
            description += ' (' + str(prod['barcode']) + ')'
        entry = {
            "providerItemId": prod['product_name'],
            "quantity": prod['amount_taken'],
            "pricePerUnit": str(prod['price']).replace('₪', ''),
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
    if db_morder:
        # "dueDate": db_morder.updated.strftime("%Y-%m-%d"),
        customer_details['dueDate'] = db_morder.updated.strftime("%Y-%m-%d")
        customer_details["title"] = 'הזמנה מספר ' + str(db_morder.id)
    return customer_details


def process_exel_to_providers_docx(file):
    #  pd.read_excel(xls, sheetName, header=0, dtype=str)
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


def request_dride_auth():
    url = FULL_DOMAIN + '/oauth2callback/'
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRET_PATH, scopes=['https://www.googleapis.com/auth/drive'])
    flow.redirect_uri = url
    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type='offline',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')

    return redirect(authorization_url)


def sheetsurl_to_providers_docx(request):
    if request.user.is_authenticated and request.user.is_superuser:
        logs = []
        # get sheets urls from urls in request.POST['urls']
        urls = request.POST['urls'].splitlines()
        urls = list(filter(lambda x: x != '', urls))
        # create a ProvidersDocxTask with urls as links
        task = ProvidersDocxTask.objects.create(
            links=urls)
        Thread(target=sheetsurl_to_providers_docx_task,
               args=(task.id,)).start()

        return redirect('providers_docx_task', task_id=task.id)
    else:
        return HttpResponseForbidden()


def exel_to_providers_docx(request):
    if request.user.is_authenticated and request.user.is_superuser:
        if(request.method == "POST"):
            # print(request.FILES)
            file = request.FILES.get('file', None)
            if file:
                try:
                    info = process_exel_to_providers_docx(file)
                    data = info['data']
                    client_names = list(map(lambda x: x.split(' ')[
                        -1], info['sheets_names']))
                    # iterate the keys (provider_names) and generate_provider_docx for each
                    # docs = []
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
                except Exception as e:
                    return JsonResponse({'error': str(e), 'details': traceback.format_exc()})
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


def providers_docx_task(request, task_id):
    if request.user.is_authenticated and request.user.is_superuser:
        task = ProvidersDocxTask.objects.get(id=task_id)
        return render(request, 'admin/providers_docx_task.html', {'task': task})
    else:
        return HttpResponseForbidden()


@csrf_exempt
def oauth2callback(request, next=None):
    if request.user.is_authenticated and request.user.is_superuser:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            GOOGLE_CLIENT_SECRET_PATH, scopes=['https://www.googleapis.com/auth/drive'])
        # flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        #     'client_secret.json',
        #     scopes=['https://www.googleapis.com/auth/spreadsheets.readonly'])
        flow.redirect_uri = request.build_absolute_uri(
            reverse('oauth2callback'))
        authorization_response = request.build_absolute_uri()
        flow.fetch_token(authorization_response=authorization_response)
        credentials = flow.credentials
        print(credentials)
        session = flow.authorized_session()
        request.session['credentials'] = credentials_to_dict(credentials)
        return redirect(request.session['next'])


def credentials_to_dict(credentials):
    return {'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes}


@csrf_exempt
def sheetsurl_to_smartbee_async(request):
    # TODO: add admin check
    # credantials = request.session.get('credentials', None)
    # drive_creds = Credentials(token=credantials['token'], refresh_token=credantials['refresh_token'], token_uri=credantials['token_uri'],
    #                           client_id=credantials['client_id'], client_secret=credantials['client_secret'], scopes=credantials['scopes'],)
    # drive_service = build_drive_service(drive_creds)
    # sheet_url = 'https://docs.google.com/spreadsheets/d/19Uy_dsD90KXnSg-2JodmDZLogT9EMD5c_riqbcOJgts/edit#gid=546059056'
    # fileId = '19Uy_dsD90KXnSg-2JodmDZLogT9EMD5c_riqbcOJgts'
    # bytes_exel_file = get_drive_file(drive_service, fileId)
    # # conver bytes to in memory file
    # file = io.BytesIO(bytes_exel_file)
    # # process the file
    # all_sheets = pd.ExcelFile(file)
    # # f'https://docs.google.com/spreadsheets/d/{doc_id}/gviz/tq?tqx=out:csv&sheet={sheet_name}'
    # # get sheetname from url
    # sheetname = get_sheetname_from_driveurl(sheet_url, drive_creds)

    if(request.method == "POST"):
        # read the url from the POST body:
        url = request.POST.get('sheet_url')
        print(url)
        docType = request.POST.get('docType')
        gspred_client = get_gspread_client()
        workbook = None
        try:
            workbook = gspred_client.open_by_url(url)
        # gspread.exceptions.APIError: {'code': 403, 'message': 'The caller does not have permission', 'status': 'PERMISSION_DENIED'}
        except gspread.exceptions.APIError as e:
            print(e)
            return HttpResponse('error: ' + str(e), status=403,)

        # get the sheet as a dataframe
        # url = 'https://docs.google.com/spreadsheets/d/19Uy_dsD90KXnSg-2JodmDZLogT9EMD5c_riqbcOJgts/edit#gid=546059056'
        gid = int(url.split('#gid=')[1])
        worksheets = workbook.worksheets()
        worksheet = None
        for ws in worksheets:
            if ws.id == gid:
                worksheet = ws
                break
        if worksheet is None:
            return HttpResponse('error: worksheet not found', status=404,)

        # 2 first rows
        all_values = worksheet.get_all_values()
        data1 = all_values[0:2]
        data2 = all_values[2:]
        df = pd.DataFrame(data1[1:], columns=data1[0])
        df2 = pd.DataFrame(data2[1:], columns=data2[0])
        info = get_smartbee_info_from_dfs(df, df2, worksheet.title, 'invoice')
        morder_id = df['מספר הזמנה'][0]
        obj, errors = send_smartbe_info(
            info=info, morder_id=int(morder_id) if morder_id else None)
        if errors:
            return JsonResponse({'status': 'error', 'errors': errors})
        ret = {
            'status': 'ok',
            'id': obj.id,
            'result': obj.result,
            'morder_id': obj.morder_id,
        }
        return JsonResponse(ret)

    # order_id = None
    # df = all_sheets.parse(sheet_name=sheetname)
    # df2 = all_sheets.parse(
    #     sheet_name=sheetname, skiprows=2, )
    # info = get_smartbee_info_from_dfs(
    #     df, df2, sheetname, 'invoice')
    # obj, errors = send_smartbe_info(
    #     info=info, morder_id=int(order_id) if order_id else None)


@ csrf_exempt
def sheetsurl_to_smartbee(request):
    if request.user.is_authenticated and request.user.is_superuser:
        if(request.method == "POST"):

            # read the url from the POST body:
            url = request.POST.get('sheet_url')
            print(url)
            docType = request.POST.get('docType')
            credantials = request.session.get('credentials', None)
            drive_creds = Credentials(token=credantials['token'], refresh_token=credantials['refresh_token'], token_uri=credantials['token_uri'],
                                      client_id=credantials['client_id'], client_secret=credantials['client_secret'], scopes=credantials['scopes'],)
            drive_service = build_drive_service(drive_creds)
            if url:
                # https://docs.google.com/spreadsheets/d/1Qtkm3krWMmRSXKGWFwkw1giuypjjjfhGie-bjTieSJM/edit#gid=241255938
                # fileId = 1Qtkm3krWMmRSXKGWFwkw1giuypjjjfhGie-bjTieSJM
                # sheetId = 241255938
                fileId = url.split(
                    'https://docs.google.com/spreadsheets/d/')[1].split('/edit')[0]
                sheetId = url.split('gid=')[1]
                bytes_exel_file = get_drive_file(drive_service, fileId)
                # conver bytes to in memory file
                file = io.BytesIO(bytes_exel_file)
                # process the file
                all_sheets = pd.ExcelFile(file)
                # f'https://docs.google.com/spreadsheets/d/{doc_id}/gviz/tq?tqx=out:csv&sheet={sheet_name}'
                # get sheetname from url
                sheetname = get_sheetname_from_driveurl(url, drive_creds)
                order_id = None
                df = all_sheets.parse(sheet_name=sheetname)
                df2 = all_sheets.parse(
                    sheet_name=sheetname, skiprows=2, )
                info = get_smartbee_info_from_dfs(
                    df, df2, sheetname, docType)
                obj, errors = send_smartbe_info(
                    info=info, morder_id=int(order_id) if order_id else None)
                if errors:
                    return JsonResponse({'errors': errors})

            else:
                return JsonResponse({'error': 'no url'})
            return redirect('/admin-upload-docs/')

        else:
            return JsonResponse({'error': 'call should be POST'})
    else:
        return JsonResponse({'error': 'user is not authenticated'})


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
                    obj, errors = send_smartbe_info(info=info, morder_id=int(
                        order_id))  # TODO: rmeove this
                    if errors:
                        return JsonResponse({'errors': errors})
                    # return JsonResponse(info, safe=False)

            else:
                messages.add_message(request, messages.ERROR, 'נא להוסיף קובץ')

        return redirect('/admin/morders/morder/')


def send_smartbe_info(info, morder_id):
    from morders.models import MOrder
    smartbee_auth = SmartbeeTokens.get_or_create_token()
    headers = {"Authorization": "Bearer " + smartbee_auth.token}
    smartbee_response = requests.post(
        SMARTBEE_DOMAIN + '/api/v1/documents/create', json=info, headers=headers)
    if smartbee_response.status_code == 200:
        print(smartbee_response.json())
        # self.isOrder = True
        # self.save()
        data = smartbee_response.json()
        resultId = info['providerMsgId']

        try:
            morder_obj = MOrder.objects.get(id=morder_id)
        except MOrder.DoesNotExist:
            morder_obj = None
        obj = SmartbeeResults.objects.create(morder=morder_obj,
                                             resultCodeId=data['resultCodeId'],
                                             result=data['result'],
                                             validationErrors=data['validationErrors'],
                                             resultId=resultId)
        print(data)
        return obj, None
    else:
        # print(smartbee_response)
        # print(smartbee_response.json())
        return None, smartbee_response.json()


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
            # send_cart_notification(db_cart.id)
            turn_to_morder_and_send_telegram_notification_task(db_cart.id)
            pass
        else:
            # send_cart_notification.delay(db_cart.id)
            turn_to_morder_and_send_telegram_notification_task.delay(
                db_cart.id)
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
