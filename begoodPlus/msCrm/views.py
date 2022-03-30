from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmUser
from .tasks import new_user_subscribed_task
from .serializers import MsCrmIntrestSerializer, MsCrmBusinessTypeSerializer
import pandas as pd
from django.shortcuts import render,redirect
# Create your views here.


def import_mscrm_from_exel(request):
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
                        select = MsCrmBusinessTypeSelect.objects.get(name=row['select'])
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
                        intrObj = MsCrmIntrest.objects.get(name=intr)
                        intrestsObjs.append(intrObj)
                crmObjs = MsCrmUser.objects.filter(businessName=bname, name=name)
                if len(crmObjs) == 0:
                    crmObj = MsCrmUser.objects.create(businessName=bname, name=name, businessSelect=select, businessTypeCustom=customSelect, phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
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
                crmObj.intrests.set(intrestsObjs)
                crmObj.save()
            #messages.add_message(request, messages.INFO, '{} משתמשים נוצרו'.format(user_created_counter))
            #messages.add_message(request, messages.INFO, '{} משתמשים שונו'.format(user_updated_counter))#, businessTypeCustom=customSelect, phone=phone, email=email, want_emails=want_emails, want_whatsapp=want_whatsapp, address=address)
            return redirect('/admin/msCrm/mscrmuser/')
        else:
            return render(request, 'upload_crm_execl2.html')

def get_all_interests(request):
    intrests = MsCrmIntrest.objects.all()
    data = MsCrmIntrestSerializer(intrests, many=True).data
    return JsonResponse(data, safe=False)

def get_all_business_types(request):
    businessTypes = MsCrmBusinessTypeSelect.objects.all()
    data = MsCrmBusinessTypeSerializer(businessTypes, many=True).data
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
        businessTypeObj = MsCrmBusinessTypeSelect.objects.get(name=businessType)
        crmObj, is_created = MsCrmUser.objects.get_or_create(businessName=form_data['business-name'], name=form_data['name'], businessSelect=businessTypeObj, phone=phone)
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