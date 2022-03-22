from http.client import REQUEST_ENTITY_TOO_LARGE
from django.shortcuts import redirect, render
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from    mcrm.models import CrmTag
from mcrm.models import CrmUser
from mcrm.tasks import new_user_subscribed_task
import pandas as pd
from django.contrib import messages


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
    
    

# Create your views here.
@api_view(['POST'])
@permission_classes((AllowAny,))
def mcrm_lead_register(request):
    form_data = request.data # 4147
    crmObj, is_created = CrmUser.objects.get_or_create(businessName=form_data['business-name'], name=form_data['name'],)
    crmObj.businessType = form_data['business-type']
    crmObj.businessTypeCustom = form_data.get('business-type-other', None)
    phone = form_data.get('phone', crmObj.phone)
    if (phone.startswith('05')):
        phone = phone[1:]
        phone = '+972' + phone
    phone = phone.replace('-', '')
    phone = phone.replace(' ', '')
    crmObj.phone = phone
    crmObj.email = form_data.get('email', crmObj.email)
    crmObj.want_emails = True if form_data.get('mailing-list', None) == 'on' else False
    crmObj.want_whatsapp = True if form_data.get('whatsapp-list', None) == 'on' else False
    crmObj.save()
    new_user_subscribed_task.delay(crmObj.id)
    #new_user_subscribed_task(crmObj.id)
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': crmObj.id,
        'is_created': is_created,
    })
    
