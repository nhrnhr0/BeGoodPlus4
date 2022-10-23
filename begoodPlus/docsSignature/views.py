from io import BytesIO
from django.http import JsonResponse
from django.shortcuts import render
from django.core.files.uploadedfile import InMemoryUploadedFile
from datetime import datetime
# Create your views here.
import json
from .models import DOC_STATUS_OPTIONS, MOrderSignature, MOrderSignatureItem, MOrderSignatureItemDetail
import cloudinary
import base64


def save_image_to_cloudinary(image_data, name, folder="site/signiture-pics/"):
    image_data = image_data.split(',')[1]
    image_data_bytes = image_data.encode()
    bytes_io = BytesIO(base64.b64decode(image_data_bytes))
    mfile = InMemoryUploadedFile(
        file=bytes_io,
        field_name=None,
        name=name,
        content_type='image/png',
        size=len(image_data),
        charset=None
    )
    res = cloudinary.uploader.upload(mfile,
                                     folder=folder,
                                     #public_id = fname,
                                     unique_filename=False,
                                     use_filename=True,
                                     overwrite=True,
                                     invalidate=True
                                     )
    return res['url']


def api_sign_on_doc(request, uuid):
    if(request.method == 'POST'):
        # get file from request
        data = json.loads(request.body)
        # example data:
        # uuid':
        # 'af3e45b6-c5e5-4f09-890f-c8faa1509954'
        # 'signature':
        # 'data: image/png; base64, iVBORw0KGgoAAAANSUhEUgAAAiYAAADICAYAAADcHyqdAAAAAXNSR0IArs4c6QAAFM1JREFUeF7t3TGIHNUfB/AJBIwQIUWKgEL+diktAiIoaik2diljCsFSwVJIghaChVpZxvSCsUgnxICFpZ1lDFoIBnJFBEElf37LveNl3LvdvZ2d/c2+z8Bxl2R35r3P7+Xue2/ezJx4/Pjx485GgAABAgQIEEggcEIwSVAFTSBAgAABAgRmAoKJgUCAAAECBAikERBM0pRCQwgQIECAAAHBxBggQIAAAQIE0ggIJmlKoSEECBAgQICAYGIMECBAgAABAmkEBJM0pdAQAgQIECBAQDAxBggQIECAAIE0AoJJmlJoCAECBAgQICCYGAMECBAgQIBAGgHBJE0pNIQAAQIECBAQTIwBAgQIECBAII2AYJKmFBpCgAABAgQICCbGAAECBAgQIJBGQDBJUwoNIUCAAAECBAQTY4AAAQIECBBIIyCYpCmFhhAgQIAAAQKCiTFAgAABAgQIpBEQTNKUQkMIECBAgAABwcQYIECAAAECBNIICCZpSqEhBAgQIECAgGBiDBAgQIAAAQJpBASTNKXQEAIECBAgQEAwGXAM/PLLL7O9xef4ePDgQffnn39258+fX/oo//vf/458bf3vi1679EG9kAABAgQIJBEQTNYoRISPmzdvdt9///3so79duHChe/ToUXfy5MmDwLLG4ea+tR9U4s/xUcJQfP3aa68NfVj7I0CAAAECGxEQTI7BGoHk+vXr3VdffTULAfGDPz6/+uqrs70tGwTKDEtpQv/PZfYl9l3/2/37958IOv2ZmnldKgGmtDWCSwkxZl6OMQi8hQABAgQ2IiCYrMBaB5J427Vr17qrV6+usIdxXlqCSpnFuXv37kGwmTezUwLK2bNnuxdffLG7ePHiSgFrnF45CgECBAi0ICCYLFnlmB155513un/++Wc203Djxo2lZ0aWPMRoL6uDS8y+lDUx/...
        from django.utils import timezone
        import pytz
        # timezone Israel
        # save image to cloudinary
        image_url = save_image_to_cloudinary(
            data['signature'], 'signature.png', folder="site/signitures/")
        # save data to database
        order = MOrderSignature.objects.get(uuid=uuid)
        order.signature = image_url
        order.status = DOC_STATUS_OPTIONS[2][0]  # Signed
        order.signature_cimage = image_url
        order.signed_at = timezone.now().astimezone(pytz.timezone('Asia/Jerusalem'))

        # check if signature_info is empty, if yes, make it an array
        if(order.signature_info == '' or order.signature_info == None):
            order.signature_info = []

        # get user info
        user = request.user
        ip = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT')
        # add user info to signature_info

        order.signature_info.append({
            'user': user.id,
            'ip': ip,
            'user_agent': user_agent,
            'signed_at': timezone.now().astimezone(pytz.timezone('Asia/Jerusalem')).strftime("%Y-%m-%d %H:%M:%S")
        })
        order.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error', 'message': 'not post request'})


def api_get_doc_signature(request, uuid):
    obj = MOrderSignature.objects.prefetch_related(
        'items', 'items__details',  'items__details__color',  'items__details__size',  'items__details__varient').get(uuid=uuid)
    return JsonResponse(serialize_doc_signature(obj))


def api_adit_doc_signature(request, uuid):
    if (request.user.is_superuser == False):
        return JsonResponse({'error': 'not superuser'})
    if(request.method == 'POST'):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        # 'uuid':
        # 'af3e45b6-c5e5-4f09-890f-c8faa1509954'
        # 'client_name':
        # 'באן תאי מ.נ. מרקט בע"מ'
        # 'status':
        # 'Draft'
        # 'items':
        # [{'id': 65, 'name': 'תיק צד דמוי עור', 'description': '* תיק צד אלגנטי בעל ... לאורך זמן', 'cimage': 'data:image/png;base6...5ErkJggg==', 'price': '21.00', 'show_details': True, 'details': [...], 'details_pivot': {...}}, {'id': 66, 'name': 'תיק צד עור לגבר', 'description': '* תיק צד עור לגבר', 'cimage': 'https://res.cloudina...Y5BB5R.png', 'price': '38.00', 'show_details': True, 'details': [...], 'details_pivot': {...}}, {'id': 67, 'name': 'תיק צד צבאי הסוואה לחגורה', 'description': '* קייס טלפון גדול וע...גוון צבעים', 'cimage': 'https://res.cloudina...bg-preview', 'price': '16.00', 'show_details': True, 'details': [...], 'details_pivot': {...}}, {'id': 41, 'name': 'אוזניית בלוטוס שלט ק...ETRACTABLE', 'description': '* עד 7 שעות שיחה והא...דש החולצה.', 'cimage': 'https://res.cloudina...y59SKw.png', 'price': '60.00', 'show_details': True, 'details': [...], 'details_pivot': {...}}, {'id': 42, 'name': 'ארנק דמוי עור', 'description': '* ארנק דמוי עור במגוון דוגמאות', 'cimage': 'https://res.cloudina...bg-preview', ...

        # get the object by uuid
        obj = MOrderSignature.objects.get(uuid=uuid)
        # update the object's fields
        obj.client_name = body['client_name']
        obj.status = body['status']
        # save the object
        obj.save()
        # get the items
        items = body['items']
        # loop over the items
        for item in items:
            # get the item by id
            item_obj = MOrderSignatureItem.objects.get(id=item['id'])
            # update the item's fields
            item_obj.name = item['name']
            item_obj.description = item['description']
            item_obj.price = item['price']
            item_obj.show_details = item['show_details']
            if item['cimage'].startswith('data:image'):
                # image data;str
                image_data = item['cimage']
                # save the image to cloudinary and get the url
                url = save_image_to_cloudinary(
                    image_data, item_obj.name + str(item_obj.id))
                # update the item's cimage field
                item_obj.cimage = url
            # save the item
            item_obj.save()
            # get the details
            details = item['details']
            # loop over the details
            for detail in details:
                # get the detail by id
                detail_obj = MOrderSignatureItemDetail.objects.get(
                    id=detail['id'])  # quantity, color, size, varient
                # update the detail's fields
                detail_obj.quantity = detail['quantity']
                # detail_obj.color = detail['color']
                # detail_obj.size = detail['size']
                # detail_obj.varient = detail['varient']
                # save the detail
                if detail_obj.quantity == 0 or detail_obj.quantity == None:
                    detail_obj.delete()
                else:
                    detail_obj.save()
        return JsonResponse({'status': 'ok'})
    obj = MOrderSignature.objects.prefetch_related('items', 'items__details',  'items__details__color',  'items__details__size',  'items__details__varient').get(
        uuid=uuid)
    # client_name
    # status
    # items
    #     name
    #     description
    #     cimage
    #     price
    #     show_details
    #     details
    #         quantity
    #         color
    #         size
    #         varient
    ret = serialize_doc_signature(obj)
    return JsonResponse(ret)


def serialize_doc_signature(obj):
    ret = {
        'uuid': obj.uuid,
        'client_name': obj.client_name,
        'status': obj.status,
        'signature': obj.signature_cimage,
        'items': [],
    }
    for item in obj.items.all():
        ret['items'].append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'cimage': item.cimage,
            'price': item.price,
            'show_details': item.show_details,
            'details': [],
        })
        for detail in item.details.all():
            ret['items'][-1]['details'].append({
                'id': detail.id,
                'quantity': detail.quantity,
                'color_id': detail.color.id,
                'color_name': detail.color.name,
                'size_id': detail.size.id,
                'size_code': detail.size.code,
                'size_name': detail.size.size,
                'varient_id': detail.varient.id if detail.varient else '',
                'varient_name': detail.varient.name if detail.varient else '',
            })
    return ret


def edit_doc_signature(request, uuid):
    if(request.user.is_superuser == False):
        return JsonResponse({'error': 'not superuser'})

    # obj = MOrderSignature.objects.get(uuid=uuid)
    # context = {
    #     'doc_signature': obj
    # }
    context = {
        'my_data': {
            'uuid': uuid
        },
    }
    return render(request, 'docsSignature/edit_doc_signature.html', context)
