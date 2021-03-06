from cmath import nan
from http.client import REQUEST_ENTITY_TOO_LARGE
from django.shortcuts import redirect, render
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from    mcrm.models import CrmTag
from mcrm.models import CrmUser
from mcrm.serializers import CrmBusinessTypeSerializer, CrmIntrestSerializer
from mcrm.tasks import new_user_subscribed_task
import pandas as pd
from django.contrib import messages
import math

def admin_upload_bulk_crm_exel(request):
    users_created_counter = 0
    tags_created_counter = 0
    if(request.user.is_superuser):
        if(request.method == 'POST'):
            # read the exel file from the request
            data = pd.read_excel(request.FILES['file'],dtype=str)
            for index, row in data.iterrows():
                name = row['שם בטלפון של עידן']
                buisness_name = row['שם העסק']
                buisness_types = row['סוג העסק']
                phone = row['טלפון']
                if phone.endswith('.0'):
                    phone = phone[:-2]
                user_tags = buisness_types.split(',')
                
                crm_user, is_created = CrmUser.objects.get_or_create(name=name, businessName=buisness_name)
                if is_created:
                    users_created_counter += 1
                crm_user.businessType = buisness_types
                crm_user.phone = phone
                for u_tag in user_tags:
                    u_tag.strip()
                    tag, is_created = CrmTag.objects.get_or_create(name=u_tag)
                    if is_created:
                        tags_created_counter += 1
                    crm_user.tags.add(tag)
                crm_user.save()
            messages.add_message(request, messages.SUCCESS, '{} משתמשים חדשים. בקובץ נמצאו {} משתמשים'.format(users_created_counter, len(data)))
            messages.add_message(request, messages.SUCCESS, 'נוצרו עוד {} תגים חדשים'.format(tags_created_counter))
            return redirect('/admin/mcrm/crmuser/')
        else:
            return render(request, 'admin_upload_bulk_crm_exel.html')
    else:
        redirect('/admin/')
    # redirect to mcrm admin view
    
    
from .models import CrmBusinessTypeSelect, CrmIntrest

def get_all_interests(request):
    intrests = CrmIntrest.objects.all()
    data = CrmIntrestSerializer(intrests, many=True).data
    return JsonResponse(data, safe=False)

def get_all_business_types(request):
    businessTypes = CrmBusinessTypeSelect.objects.all()
    data = CrmBusinessTypeSerializer(businessTypes, many=True).data
    return JsonResponse(data, safe=False)

# Create your views here.
@api_view(['POST'])
@permission_classes((AllowAny,))
def mcrm_lead_register(request):
    form_data = request.data # 4147
    
    phone = form_data.get('phone', '')
    if (phone.startswith('05')):
        phone = phone[1:]
        phone = '+972' + phone
    phone = phone.replace('-', '')
    phone = phone.replace(' ', '')
    #phone = phone.replace('\u')
    phone = phone.replace('\u2066', '')
    
    
    businessTypes = form_data['business_types']
    for businessType in businessTypes:
        businessType = businessType.strip()
        businessTypeObj = CrmBusinessTypeSelect.objects.get(name=businessType)
        crmObj, is_created = CrmUser.objects.get_or_create(businessName=form_data['business-name'], name=form_data['name'], businessSelect=businessTypeObj, phone=phone)
        if businessType == 'אחר - פרט למטה':
            crmObj.businessTypeCustom = form_data.get('business-type-other',crmObj.businessTypeCustom)
        if phone != '':
            crmObj.phone = phone
        crmObj.email = form_data.get('email', crmObj.email)
        crmObj.want_emails = True if form_data.get('mailing-list', None) == 'on' else False
        crmObj.want_whatsapp = True if form_data.get('whatsapp-list', None) == 'on' else False
        crmObj.address = form_data.get('address', crmObj.address)
        crmObj.save()
        new_user_subscribed_task.delay(crmObj.id)
    #new_user_subscribed_task(crmObj.id)
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': crmObj.id,
        'is_created': is_created,
    })
    
def upload_crm_execl2(request):
    user_created_counter = 0
    user_updated_counter = 0
    if request.user and request.user.is_superuser:
        
        if request.method == 'POST':
            xls = pd.ExcelFile(request.FILES['file'])
            df1 =  pd.read_excel(xls, 'Sheet1')
            for index, row in df1.iterrows():
                bname = row['שם העסק']
                name = row['שם']
                select = None
                if isinstance(row['select'], str):
                    try:
                        select = CrmBusinessTypeSelect.objects.get(name=row['select'])
                    except:
                        select = None
                customSelect = None
                if isinstance(row['עסק לא מוגדר'], str):
                    customSelect = row['עסק לא מוגדר']
                phone = row['טלפון']
                email = row['אימייל']
                want_emails = True if row['רוצה מיילים'] == 1 else False
                want_whatsapp = True if row['רוצה וואצאפ'] == 1 else False
                address = row['כתובת']
                intrests = row['תחומי עניין']
                intrestsObjs = []
                if isinstance(intrests, str):
                    intrests = intrests.split(',')
                    intrests = [x.strip() for x in intrests]
                    for intr in intrests:
                        intrObj = CrmIntrest.objects.get(name=intr)
                        intrestsObjs.append(intrObj)
                crmObjs = CrmUser.objects.filter(businessName=bname, name=name)
                if len(crmObjs) == 0:
                    crmObj = CrmUser.objects.create(businessName=bname, name=name, businessSelect=select, businessTypeCustom=customSelect, phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
                else:
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
                crmObj.intrested.set(intrestsObjs)
                crmObj.save()
            messages.add_message(request, messages.INFO, '{} משתמשים נוצרו'.format(user_created_counter))
            messages.add_message(request, messages.INFO, '{} משתמשים שונו'.format(user_updated_counter))#, businessTypeCustom=customSelect, phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
            return redirect('/admin/mcrm/crmuser/')
        else:
            return render(request, 'upload_crm_execl2.html')
def upload_crm_execl(request):
    if request.user and request.user.is_superuser:
        if request.method == 'POST':
            
            xls = pd.ExcelFile(request.FILES['file'])
            df1 =  pd.read_excel(xls, 'Sheet1')
            df_tags = pd.read_excel(xls, 'תגים')
            df_intrests = pd.read_excel(xls, 'תחומי_עניין')

            
            users_created_counter = 0
            tags_scaned_counter = 0
            intrests_scaned_counter = 0
            tags_created_counter = 0
            intrests_created_counter = 0
            for index, row in df_tags.iterrows():
                crmtagObj, is_created = CrmTag.objects.get_or_create(name=row['תגים'])
                tags_scaned_counter += 1
                if is_created:
                    tags_created_counter += 1
            for index, row in df_intrests.iterrows():
                crmintrestObj, is_created = CrmIntrest.objects.get_or_create(name=row['תחומי עניין'])
                intrests_scaned_counter += 1
                if is_created:
                    intrests_created_counter += 1
                
            
            
            
            
            for index, row in df1.iterrows():
                #print(index, row)
                # data.columns
                #Index(['שם עסק', 'סוג עסק', 'סוג עסק חדש', 'שם', 'טלפון', 'אימייל', 'רוצה אימיילים', 'רוצה וואצאפ', 'כתוכת', 'תגים', 'תחומי עניין', 'רשימת תגים', 'רשימת תחומי עניין'], dtype='object')
                userInfo = {
                    'businessName': row['שם עסק'],
                    'businessType': row['סוג עסק'],
                    'businessTypeCustom': row['סוג עסק חדש'],
                    'name': row['שם'],
                    'phone': row['טלפון'],
                    'email': row['אימייל'],
                    'want_emails':row['רוצה אימיילים'],
                    'want_whatsapp':  row['רוצה וואצאפ'],
                    'address': row['כתוכת'],
                }
                crm_user, is_created = CrmUser.objects.get_or_create(businessName=userInfo['businessName'], name=userInfo['name'],)
                crm_user.businessType =  userInfo['businessType']
                crm_user.businessTypeCustom = userInfo['businessTypeCustom'] if isinstance(userInfo['businessTypeCustom'], str) else crm_user.businessTypeCustom
                phone = userInfo['phone'] if isinstance(userInfo['phone'], str) else userInfo['phone']
                if phone and isinstance(phone, str):
                    if (phone.startswith('05')):
                        phone = phone[1:]
                        phone = '+972' + phone
                    phone = phone.replace('-', '')
                    phone = phone.replace(' ', '')
                    phone = phone.replace('⁩', '')
                    phone = phone.replace('+', '')
                    crm_user.phone = phone
                crm_user.email = userInfo['email'] if isinstance(userInfo['email'], str) else crm_user.email
                crm_user.want_emails = userInfo['want_emails']
                crm_user.want_whatsapp = userInfo['want_whatsapp']
                crm_user.address = userInfo['address'] if isinstance(userInfo['address'], str) else crm_user.address
                crm_user.save()

                if is_created:
                    users_created_counter += 1
                # split תחומי עניין ותגים by comma, find tags and intrests in db and add to crm user
                intrests = []
                if isinstance(row['תחומי עניין'],str):
                    intrests = row['תחומי עניין'].split(',')
                tags = []
                if isinstance(row['תגים'],str):
                    tags = row['תגים'].split(',')
                tags_updated_counter = 0
                tags_failed_counter = 0
                intrests_updated_counter = 0
                intrests_failed_counter = 0
                failed_tags = []
                failed_intrests = []
                crm_user.intrested.clear()
                for intrest in intrests:
                    intrest.strip()
                    try:
                        intrestObj = CrmIntrest.objects.get(name=intrest)
                        crm_user.intrested.add(intrestObj)
                        intrests_updated_counter += 1
                    except CrmIntrest.DoesNotExist:
                        intrests_failed_counter += 1
                        failed_intrests.append(intrest)

                        
                
                crm_user.tags.clear()
                for tag in tags:
                    tag.strip()
                    try:
                        tagObj = CrmTag.objects.get(name=tag)
                        crm_user.tags.add(tagObj)
                        tags_updated_counter += 1
                    except CrmTag.DoesNotExist:
                        tags_failed_counter += 1
                        failed_tags.append(tag)
                        

                crm_user.save()
                
            messages.add_message(request, messages.INFO, '{} משתמשים נוצרו'.format(users_created_counter))
            messages.add_message(request, messages.INFO, '{} תגים בקובץ'.format(tags_scaned_counter))
            messages.add_message(request, messages.INFO, '{} תגים חדשים'.format(tags_created_counter))
            messages.add_message(request, messages.INFO, '{} תגים שהתחברו למשתמש'.format(tags_updated_counter))
            messages.add_message(request, messages.INFO, '{} שגיאות בתגים'.format(tags_failed_counter))
            messages.add_message(request, messages.INFO, '{} התעניינויות בקובץ'.format(intrests_scaned_counter))
            messages.add_message(request, messages.INFO, '{} התענייניות חדשות'.format(intrests_created_counter))
            messages.add_message(request, messages.INFO, '{} התענייניות שהתחברו למשתמש'.format(intrests_updated_counter))
            messages.add_message(request, messages.INFO, '{} שגיאות בהתעניינויות'.format(intrests_failed_counter))
            messages.add_message(request, messages.INFO, '{} התגים הנכשלים'.format(failed_tags))
            messages.add_message(request, messages.INFO, '{} ההתעניינויות שנכשלו'.format(failed_intrests))
            return redirect('/admin/mcrm/crmuser/')
        else:
            return render(request, 'upload_crm_execl.html')
        
    else:
        # redirect to /admin/login/?next=<current_url>
        return redirect('/admin/login/?next=/admin/mcrm/upload_crm_execl/')