from django.shortcuts import render
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from mcrm.models import CrmUser
from mcrm.tasks import new_user_subscribed_task

# Create your views here.
@api_view(['POST'])
@permission_classes((AllowAny,))
def mcrm_lead_register(request):
    form_data = request.data # 4147
    crmObj, is_created = CrmUser.objects.get_or_create(businessName=form_data['business-name'], name=form_data['name'],)
    crmObj.businessType = form_data['business-type']
    crmObj.phone = form_data.get('phone', crmObj.phone)
    crmObj.email = form_data.get('email', crmObj.email)
    crmObj.want_emails = True if form_data.get('mailing-list', None) == 'on' else False
    crmObj.want_whatsapp = True if form_data.get('whatsapp-list', None) == 'on' else False
    crmObj.save()
    #new_user_subscribed_task.delay(crmObj.id)
    new_user_subscribed_task(crmObj.id)
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': crmObj.id,
        'is_created': is_created,
    })
    