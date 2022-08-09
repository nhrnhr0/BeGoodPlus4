import uuid
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.permissions import AllowAny

from .models import LeadSubmit, MsCrmBusinessSelectToIntrests, MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmIntrestsGroups, MsCrmUser
from .tasks import new_user_subscribed_task
from .serializers import MsCrmIntrestSerializer, MsCrmBusinessTypeSerializer, MsCrmIntrestsGroupsSerializer, MsCrmPhoneContactsSerializer
import pandas as pd
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponse
from django.db.models import Prefetch

def fix_ms_crm(request):
    if request.user and request.user.is_superuser:
        
        if request.method == "GET":
            return render(request, 'msCrm/fix_ms_crm.html')
        elif request.method == "POST":
            # iterate over all msCrmUsers and resave them
            msCrmUsers = MsCrmUser.objects.all()
            for msCrmUser in msCrmUsers:
                msCrmUser.save()

            
            
            file = request.FILES['file']
            df = pd.read_excel(file, header=0, dtype=str)
            for index, row in df.iterrows():
                phone = str(row['טלפון'])
                phone = phone.replace('\u200f', '')
                phone = phone.replace('\u202a', '')
                phone = phone.replace('\u202c', '')
                phone = phone.replace('\u200f', '')
                phone = phone.replace('⁩', '')
                phone = phone.replace('⁦', '')
                phone = ''.join(e for e in phone if e.isalnum())
                if phone.startswith('05'):
                    phone = '972' + phone[1:]
                if phone.startswith('+'):
                    phone = phone[1:]
                
                
                # find the user with the phone number
                user = MsCrmUser.objects.filter(phone=phone)
                if user.exists():
                    user = user.first()
                    businessSelectStr = row['select']
                    businessSelectObj = MsCrmBusinessTypeSelect.objects.filter(name=businessSelectStr)
                    if businessSelectObj.exists():
                        businessSelectObj = businessSelectObj.first()
                        user.businessSelect = businessSelectObj
                        user.save()
            return redirect('/admin/msCrm/mscrmuser/')


@api_view(['GET'])
def get_all_mscrm_phone_contacts(request):
    if(request.user.is_superuser):
        phoneContacts = MsCrmUser.objects.filter(phone__isnull=False)
        data = MsCrmPhoneContactsSerializer(phoneContacts, many=True).data
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error":"not authorized"}, safe=False)
# Create your views here.
def upload_mscrm_business_select_to_intrests_exel(request):
    if request.user and request.user.is_superuser:
        
        if request.method == "GET":
            return render(request, 'msCrm/upload_mscrm_business_select_to_intrests_exel.html')
        elif request.method == "POST":
            
            b_select_to_intrests = MsCrmBusinessSelectToIntrests.objects.all()
            
            file = request.FILES['file']
            sheetName = request.POST.get('sheetName')
            xls = pd.ExcelFile(file)
            df1 =  pd.read_excel(xls, sheetName,header=0,dtype=str)
            existing_phone_count = 0
            new_phone_count = 0
            print(df1.head())
            for index, row in df1.iterrows():
                b_name = row['שם העסק']#str(row['שם העסק'])
                b_select_name = str(row['תחום עיסוק לפי אדמין'])
                if b_select_name == 'nan' or b_select_name == '' or b_select_name == 'None':
                    continue
                
                businessSelectObj=MsCrmBusinessTypeSelect.objects.get(name=b_select_name)
                contact_man = str(row['איש קשר'])
                if contact_man == 'nan':
                    contact_man = b_name.split(' ')[0]
                phone = row['טלפון']
                if phone.startswith('05'):
                    phone = '972' + phone[1:]
                #print(index,b_select_name, contact_man)
                if MsCrmUser.objects.filter(phone=phone).exists():
                    existing_phone_count += 1
                    continue
                else:
                    new_phone_count += 1
                
                user = MsCrmUser.objects.create(
                    businessName=b_name,
                    businessSelect=businessSelectObj,
                    name=contact_man,
                    phone=phone
                )
                entrys = b_select_to_intrests.filter(businessSelect=businessSelectObj)
                if entrys.exists():
                    entry = entrys.first()
                    user.intrests.set(entry.intrests.all())
                user.save()
            messages.add_message(request, messages.INFO, '{} מספר מספרי טלפון חדשים ו{} מספר מספרי טלפון קיימים'.format(new_phone_count, existing_phone_count))
            return redirect('/admin/msCrm/mscrmuser/')
        #return render(request, 'msCrm/upload_mscrm_business_select_to_intrests_exel.html')
    else:
        return redirect('admin/login/?next=' + request.path)

def import_mscrm_from_exel(request):
    if request.user and request.user.is_superuser:

        if request.method == 'POST':
            xls = pd.ExcelFile(request.FILES['file'])
            df1 = pd.read_excel(xls, 'Sheet1')
            users_created_counter = 0
            users_updated_counter = 0
            all_categories = CatalogAlbum.objects.filter(
                is_public=True)  # .values_list('title', flat=True)

            for index, row in df1.iterrows():
                bname = row['שם העסק']
                name = row['שם']
                select = None
                if isinstance(row['select'], str):
                    try:
                        select = MsCrmBusinessTypeSelect.objects.get(
                            name=row['select'])
                    except:
                        select = None
                customSelect = None
                if isinstance(row['עסק לא מוגדר'], str):
                    customSelect = row['עסק לא מוגדר']
                phone = row['טלפון']
                if isinstance(phone, str):
                    phone = phone.replace('-', '')
                    phone = phone.replace(' ', '')
                    phone = phone.replace('\u2069', '')
                else:
                    phone = None
                if isinstance(row['אימייל'], str):
                    email = row['אימייל']
                else:
                    email = None
                want_emails = True if row['רוצה מיילים'] == 1 else False
                want_whatsapp = True if row['רוצה וואצאפ'] == 1 else False
                if isinstance(row['כתובת'], str):
                    address = row['כתובת']
                else:
                    address = None
                userSelectedCategories = []
                for category in all_categories:
                    if row[category.title] != 'לא':
                        userSelectedCategories.append(category)

                '''intrests = row['תחומי עניין']
                intrestsObjs = []
                if isinstance(intrests, str):
                    intrests = intrests.split(',')
                    intrests = [x.strip() for x in intrests]
                    for intr in intrests:
                        intrObj = MsCrmIntrest.objects.get(name=intr)
                        intrestsObjs.append(intrObj)'''
                crmObjs = MsCrmUser.objects.filter(
                    businessName=bname, name=name)
                if len(crmObjs) == 0:
                    crmObj = MsCrmUser.objects.create(businessName=bname, name=name, businessSelect=select, businessTypeCustom=customSelect,
                                                      phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
                    users_created_counter += 1
                else:
                    users_updated_counter += 1
                    crmObj = crmObjs[0]
                    crmObj.businessSelect = select
                    crmObj.businessTypeCustom = customSelect
                    if isinstance(phone, str):
                        crmObj.phone = phone
                    if isinstance(email, str):
                        crmObj.email = email
                    crmObj.want_emails = want_emails
                    crmObj.want_whatsapp = want_whatsapp
                    if isinstance(address, str):
                        crmObj.address = address

                crmObj.intrests.set(userSelectedCategories)
                # crmObj.intrests.set(intrestsObjs)
                crmObj.save()
            messages.add_message(
                request, messages.INFO, '{} משתמשים נוצרו'.format(users_created_counter))
            # , businessTypeCustom=customSelect, phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
            messages.add_message(request, messages.INFO,
                                 '{} משתמשים שונו'.format(users_updated_counter))
            return redirect('/admin/msCrm/mscrmuser/')
        else:
            return render(request, 'upload_crm_execl2.html')


def get_all_interests(request):
    #intrests = MsCrmIntrest.objects.all()
    #data = MsCrmIntrestSerializer(intrests, many=True).data
    intrests = CatalogAlbum.objects.filter(is_public=True)
    data = intrests.values_list('title', flat=True)
    ret = []
    for d in data:
        ret.append({"name": d})
    return JsonResponse(ret, safe=False)


def get_all_business_types(request):
    businessTypes = MsCrmBusinessTypeSelect.objects.all()
    data = MsCrmBusinessTypeSerializer(businessTypes, many=True).data
    return JsonResponse(data, safe=False)


def get_all_business_types_groups(request):
    if request.user and request.user.is_superuser:
        businessTypesGroups = MsCrmIntrestsGroups.objects.all()
        data = MsCrmIntrestsGroupsSerializer(
            businessTypesGroups, many=True).data
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "not authorized"}, safe=False)
    # businessTypesGroups = MsCrmIntrestsGroups.objects.all()
    # data = MsCrmIntrestsGroupsSerializer(businessTypesGroups, many=True).data
    # return JsonResponse(data, safe=False)


@api_view(['GET'])
def get_crm_users_for_whatsapp(request):
    if request.user and request.user.is_superuser:
        if request.query_params.get('businessTypes') is not None:
            businessTypes = request.query_params.get(
                'businessTypes').split(',')
        else:
            businessTypes = None
        if request.query_params.get('catalogImages') is not None:
            catalogImages = request.query_params.get(
                'catalogImages').split(',')
        else:
            catalogImages = []
        if businessTypes == '' or businessTypes is None or businessTypes == []:
            return JsonResponse([], safe=False)

        CatalogAlbumsQuerySet = CatalogAlbum.objects.filter(
            images__id__in=catalogImages)
        CatalogAlbums = CatalogAlbumOnlyNameSerializer(
            CatalogAlbumsQuerySet, many=True).data

        WhatsappMessagesQuerySet = MsCrmWhatsappMessagesSent.objects.order_by(
            '-created_at').select_related('whatsapp_message')

        users = MsCrmUser.objects.filter(
            businessSelect__id__in=businessTypes).select_related('businessSelect').prefetch_related(Prefetch('intrests', queryset=CatalogAlbumsQuerySet, to_attr='cached_intrests'), Prefetch('whatsappMessagesSent', queryset=WhatsappMessagesQuerySet, to_attr='cached_whatsappMessagesSent'))

        data = MsCrmUserWhatsappCampaignSerializer(
            users, many=True, context={'catalogImages': catalogImages, 'catalogAlbums': CatalogAlbums}).data
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "not authorized"}, safe=False)


@api_view(['GET'])
def get_crm_users_numbers_in_excel(request):
    if request.query_params.get('crmUserIds') is not None:
        crmUserIds = request.query_params.get(
            'crmUserIds').split(',')
        crmUserQuery = MsCrmUser.objects.filter(
            id__in=crmUserIds).select_related('businessSelect')
        crmUsers = MsCrmUsersForExcelSerializer(
            crmUserQuery, many=True).data
        df = pd.DataFrame(crmUsers)
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="{}.xlsx"'.format(
            uuid.uuid4())
        df.to_excel(response, index=False)
        return response
    else:
        return JsonResponse({"error": "Please provide valid crmUserIds as query params"}, safe=False)

# Create your views here.


@api_view(['POST'])
@permission_classes((AllowAny,))
def mcrm_lead_register(request):
    form_data = request.data  # 4147

    phone = form_data.get('phone', '')
    if (phone.startswith('05')):
        phone = phone[1:]
        phone = '+972' + phone
    phone = phone.replace('-', '')
    phone = phone.replace(' ', '')
    # phone = phone.replace('\u')
    phone = phone.replace('\u2066', '')

    businessTypes = form_data['business_types']
    for businessType in businessTypes:
        businessType = businessType.strip()
        businessTypeObj = MsCrmBusinessTypeSelect.objects.get(
            name=businessType)
        crmObj, is_created = MsCrmUser.objects.get_or_create(
            businessName=form_data['business-name'], name=form_data['name'], businessSelect=businessTypeObj, phone=phone)
        if businessType == 'אחר - פרט למטה':
            crmObj.businessTypeCustom = form_data.get(
                'business-type-other', crmObj.businessTypeCustom)
        if phone != '':
            crmObj.phone = phone
        crmObj.email = form_data.get('email', crmObj.email)
        crmObj.want_emails = True if form_data.get(
            'mailing-list', None) == 'on' else False
        crmObj.want_whatsapp = True if form_data.get(
            'whatsapp-list', None) == 'on' else False
        crmObj.address = form_data.get('address', crmObj.address)
        intrestObjs = []
        for intrest in form_data['intrests']:
            intrestObjs.append(CatalogAlbum.objects.get(title=intrest))
        crmObj.intrests.set(intrestObjs)
        crmObj.save()
        new_user_subscribed_task.delay(crmObj.id)
    # new_user_subscribed_task(crmObj.id)
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': crmObj.id,
        'is_created': is_created,
    })
@api_view(['POST'])
def api_save_lead(request):
    form_data = request.data
    phone = form_data.get('bussiness_phone', '')
    if (phone.startswith('05')):
        phone = phone[1:]
        phone = '+972' + phone
    phone = phone.replace('-', '')
    phone = phone.replace(' ', '')
    obj = LeadSubmit.objects.create(
        bussiness_name=form_data['bussiness_name'],
        businessType=form_data.get('bussiness_type', ''),
        address=form_data.get('bussiness_address', ''),
        name=form_data.get('bussiness_contact_name', ''),
        phone=phone
    )
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': obj.id,
    })
