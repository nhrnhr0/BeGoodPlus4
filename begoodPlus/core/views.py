from .models import UserSearchData
from django.db.models import Value, CharField
from itertools import chain
from .serializers import SearchCatalogImageSerializer, SearchCatalogAlbumSerializer
import json
from .models import Customer, BeseContactInformation
from django.contrib.contenttypes.models import ContentType
import time
from .tasks import product_photo_send_notification, send_cantacts_notificatios, send_cart_notification, send_question_notification, test
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
from django.shortcuts import render, redirect, HttpResponse
from django.http import JsonResponse
from django.db.models.functions import Greatest
from django.contrib.postgres.search import TrigramSimilarity
from rest_framework.permissions import AllowAny, IsAuthenticated
from campains.views import get_user_campains_serializer_data
from client.models import UserQuestion

from client.views import get_user_info
from clientApi.serializers import ImageClientApi
from .models import ActiveCartTracker, SvelteCartModal, SvelteCartProductEntery, SvelteContactFormModal, UserSearchData
from django.urls import reverse
from core.models import UserProductPhoto
# Create your views here.
'''
def json_user_tasks(customer):
    contacts_qs = customer.contact.filter(sumbited=False)
    contacts_task = UserTasksSerializer(contacts_qs, many=True)
    #print(contacts_task.data)
    
    return {'status':'ok','data':contacts_task.data}
def user_tasks(request):
    customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
    return JsonResponse(json_user_tasks(customer))


# TODO: unused, can be deleted
def admin_subscribe_view(request):
    webpush = {"group": 'admin' }
    return render(request, 'adminSubscribe.html',{"webpush":webpush})

 
def mainView(request, *args, **kwargs):
    return render(request, 'newMain.html', {})
'''
from .forms import FormBeseContactInformation
'''
def saveBaseContactFormView(request,next, *args, **kwargs):
    if request.method == "POST":
        form = FormBeseContactInformation(request.POST)
        if form.is_valid():
            form.save()
            print('saveBaseContactFormView')

    return redirect(next)
'''


@api_view(['POST', 'GET'])
@ensure_csrf_cookie
def set_csrf_token(request, factory_id=None):
    print('factory_id: ', factory_id)
    print('device: ', request.COOKIES.get('device'))
    """
    This will be `/api/set-csrf-cookie/` on `urls.py`
    """
    if factory_id:
        uid = str(factory_id)
    else:
        uid = str(uuid.uuid4().hex)
    return JsonResponse({"details": "CSRF cookie set",
                         'uid': uid,
                         'whoAmI': get_user_info(request.user), }, safe=False)
    # 'campains': get_user_campains_serializer_data(request.user),}, safe=False)


@api_view(['POST'])
@permission_classes((AllowAny,))
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


@api_view(['POST'])
@permission_classes((AllowAny,))
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
    #response.set_cookie('active_cart', active_cart_id, max_age=60*60*24*365*10, httponly=True)
    return response


@api_view(['POST'])
@permission_classes((AllowAny,))
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


@api_view(['POST'])
@permission_classes((AllowAny,))
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


@api_view(['POST'])
@permission_classes((AllowAny,))
def svelte_cart_form(request):
    if request.method == "POST":
        body_unicode = request.data  # body.decode('utf-8')
        device = request.COOKIES.get('device')
        body = body_unicode  # json.loads(body_unicode)
        name = body['name'] or ''
        email = body['email'] or ''
        phone = body['phone'] or ''
        business_name = body['business_name'] or ''
        uuid = body['uuid'] or ''
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
                #user_id = int(body.get('asUser') or request.user.id)
                agent = request.user
            else:
                user_id = request.user
        db_cart = SvelteCartModal.objects.create(user=user_id, device=device, uid=uuid, businessName=business_name,
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
                    unitPrice = CatalogImage.objects.get(id=pid).client_price
                except:
                    unitPrice = 0
            print_desition = p.get('print', False)
            embro = p.get('embro', False)
            try:
                obj = SvelteCartProductEntery.objects.create(
                    product_id=pid, amount=pamount, details=pentries, unitPrice=unitPrice, print=print_desition, embro=embro)
                data.append(obj)
            except:
                pass
        #data = [SvelteCartProductEntery(product_id=p['id'],amount=p['amount'] or 1, details = p['mentries'] or {}) for p in products]
        #products_objs = SvelteCartProductEntery.objects.bulk_create(data)
        db_cart.productEntries.set(data)
        db_cart.save()
        if (settings.DEBUG):
            send_cart_notification(db_cart.id)
        else:
            send_cart_notification.delay(db_cart.id)
        return JsonResponse({
            'status': 'success',
            'detail': 'form sent successfuly',
            'cart_id': db_cart.id,
            'product_ids': [p.product_id for p in data]
        })


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def svelte_cart_history(request):
    if request.user.is_anonymous:
        return JsonResponse({
            'status': 'warning',
            'detail': 'User is not authenticated',
        })
    previous_carts = list(
        SvelteCartModal.objects.all().filter(user_id=request.user).values())
    return JsonResponse(previous_carts, safe=False)


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
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
        #del df_data[i]
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


#from .tasks import save_user_search


def autocompleteModel(request):
    start = time.time()
    # if request.is_ajax():
    q = request.GET.get('q', '')
    products_qs = CatalogImage.objects.filter(Q(title__icontains=q) | Q(albums__title__icontains=q) | Q(
        albums__keywords__icontains=q) | Q(barcode__icontains=q)).distinct()
    products_qs = products_qs.filter(Q(is_active=True) & ~Q(
        albums=None) & Q(albums__is_public=True))
    #  & (~Q(albums=None) & Q(is_active = True)
#
    # is_hidden=False
    ser_context = {'request': request}
    products_qs_short = products_qs[0:20]
    products_qs_short = products_qs_short.prefetch_related(
        'colors', 'sizes', 'albums')
    products = ImageClientApi(products_qs_short, many=True, context={
        'request': request
    })
    #products = SearchCatalogImageSerializer(products_qs,context=ser_context, many=True)
    session = get_session_key(request)

    search_history = UserSearchData.objects.create(
        session=session, term=q, resultCount=products_qs.count())  # + len(mylogos.data)
    search_history.save()
    all = products.data  # + mylogos.data
    #all = all[0:20]
    context = {'all': all,
               'q': q,
               'id': search_history.id}
    print('autocompleteModel', time.time() - start)
    print('autocompleteModel', len(all))

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
        #print('BeseContactInformation ', created, obj)
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
