from django.shortcuts import render

from clientLikedImages.models import ClientLikedImage
from catalogImages.models import CatalogImage
from django.http import HttpResponse
import json
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.core.mail import EmailMessage

# Create your views here.

from django.shortcuts import render
from django.template.loader import render_to_string
def generate_email_html(clientLinkedImage):
    params = {'data':clientLinkedImage}
    html = render_to_string('contact_form_email_response.html', params)
    return html

def add_liked_images(request,  *args, **kwargs):
    if (request.is_ajax()):
        name = request.POST.get('name')
        email = request.POST.get('email')
        tel = request.POST.get('tel')
        msg = request.POST.get('message')
        request_copy = request.POST.get('send_copy')
        
        liked_images = request.POST.getlist('selected_image[]')
        images = CatalogImage.objects.filter(pk__in=liked_images)
        
        #print('add_liked_images', name, email, tel, msg, liked_images)
        response_data = {}

        
        if(name == None or email == None or tel == None): 
            #print('error add_liked_images')
            response_data['result'] = 'error'
            response_data['message'] = 'שם מייל או טלפון רייקים'
        else:
            new_record = ClientLikedImage.objects.create(name=name, email=email, tel=tel, msg=msg)
            new_record.images.set(images)
            response_data['result'] = 'sucsses'
            response_data['message'] = str(new_record)
            #print('add_liked_images', t)
        #print('add_liked_images res: ', response_data)
        email_html = generate_email_html(new_record)
        recipient_list = ['Main@ms-global.co.il',]
        if request_copy:
            recipient_list.append(email)
        
        subject =  'טופס יצירת קשר של: ' + new_record.name
        #plain_message = strip_tags(email_html)
        email = EmailMessage(subject, body=email_html,
                            from_email='MS-GLOBAL <bot@ms-global.co.il>',
                            to=recipient_list, reply_to=['Main@ms-global.co.il'])
        email.content_subtype = "html"
        mail_res = email.send(True)
        #import time
        #time.sleep(4.5)
        response_data['mail_res'] =  mail_res
        return HttpResponse(json.dumps(response_data), content_type="application/json")
    