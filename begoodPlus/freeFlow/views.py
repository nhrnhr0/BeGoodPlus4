from django.shortcuts import render

# Create your views here.

from .forms import freeFlowClientForm
from utils import utils

from webpush import send_group_notification
from django.urls import reverse

import threading, time
from freeFlow.models import FreeFlowContent

from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import translation
from django.http import HttpResponse



def freeFlowChangeLanguage(request, language_code):
    translation.activate(language_code)
    return HttpResponse(content=language_code)

def freeFlowView(request, lang='he'):
    translation.activate(lang)
    #if request.session.get(translation.LANGUAGE_SESSION_KEY) is not None:
    #    print (request.session[translation.LANGUAGE_SESSION_KEY])
    #else:
    #    request.session[translation.LANGUAGE_SESSION_KEY] = 'he'
    
    #translation.activate(request.session[translation.LANGUAGE_SESSION_KEY]) 

    content = FreeFlowContent.objects.get(pk=1)
    if request.method == 'POST':
        form = freeFlowClientForm(request.POST)
        if form.is_valid():
            #print(form)
            obj = form.save()
            name = obj.name
            email = obj.email
            phone = obj.phone
            country = obj.country
            message = obj.message
            #obj = form.instance
            url = reverse('admin:%s_%s_change' % (obj._meta.app_label,  obj._meta.model_name),  args=[obj.id] )
            payload = {"head": "Free Flow", "body": message, "icon": "https://ms-global.co.il/static/assets/freeFlow/assets/img/freeFlowFirstImage.png", "url": url}
            thread = threading.Thread(target=send_group_notification, kwargs={"group_name":"admin", "payload":payload, "ttl":1000})
            thread.start()
            
            # send email:
            recipient_list = ['Main@ms-global.co.il',] # ['Main@ms-global.co.il',]
            subject =  'freeFlow טופס הזמנה ' + obj.name
            email_body = render_to_string('freeFlow_email_template.html', {'data':obj})

            #plain_message = strip_tags(email_html)
            email = EmailMessage(subject, body=email_body,
                            from_email='MS-GLOBAL <bot@ms-global.co.il>',
                            to=recipient_list, reply_to=['Main@ms-global.co.il'])
            email.content_subtype = "html"
            mail_res = email.send(True)

    return render(request, 'freeflow2.html',{'content':content})

from .models import FreeFlowStores
from rest_framework import viewsets
from .serializers import FreeFlowStoresSerializer
class FfStoreViewSet(viewsets.ModelViewSet):
    queryset = FreeFlowStores.objects.all()#.order_by('id')
    serializer_class = FreeFlowStoresSerializer