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
    crmObj = CrmUser.objects.create(businessName=form_data['business-name'], 
                                    businessType=form_data['business-type'],
                                    name=form_data['name'],
                                    phone=form_data['phone'],
                                    email=form_data['email'],
                                    want_emails=True if form_data['mailing-list'] == 'on' else False,
                                    want_whatsapp=True if form_data['whatsapp-list'] == 'on' else False,)
    new_user_subscribed_task.delay(crmObj.id)
    return JsonResponse({
        'status': 200,
        'data': 'ok',
        'id': crmObj.id
    })
    