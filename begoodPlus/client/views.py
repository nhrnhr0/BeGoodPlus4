from django.contrib.auth.models import User
from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
#from campains.views import get_user_campains_serializer_data
from client.models import UserSessionLogger
from django.http import HttpResponse, HttpResponseRedirect
from client.models import UserLogEntry
from client.serializers import AdminClientSerializer
from .models import Client, ClientType
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

@csrf_exempt
def create_client_user(request):
    messages = []
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    if request.method == 'POST':
        data = request.POST
        buisness_name = data.get('buisness_name', None)
        name = data.get('name', None)
        phone = data.get('phone', None)
        price = data.get('price', None)
        store_type_id = data.get('store_type', None)
        store_type_obj = ClientType.objects.get(id=store_type_id)
        if not price:
            price = store_type_obj.tariff
        else:
            price = int(price)
        user, is_user_created = User.objects.get_or_create(username=buisness_name)
        newPass = buisness_name + '123'
        if is_user_created:
            user.set_password(newPass)
            user.first_name = name
            user.last_name = buisness_name
            user.save()
            messages.append('משתמש נוצר')
            messages.append('שם משתמש: {}'.format(user.username))
            messages.append('סיסמא: {}'.format(newPass))
            messages.append('<a href="{}" target="_blank">לחץ כאן לעריכה</a>'.format('/admin/auth/user/{}/change/'.format(user.id)))
        else:
            messages.append('משתמש כבר קיים')
            messages.append('שם משתמש: {}'.format(user.username))
            messages.append('<a href="{}" target="_blank">לחץ כאן לעריכה</a>'.format('/admin/auth/user/{}/change/'.format(user.id)))
        client, is_client_created = Client.objects.get_or_create(user=user)
        if is_client_created:
            client.name = name
            client.phone = phone
            client.businessName = buisness_name
            client.storeType = store_type_obj
            client.tariff = price
            client.show_prices = True
            client.save()
            messages.append('נוצר חשבון לקוח חדש')
            messages.append('<a href="{}" target="_blank">לחץ כאן לעריכה</a>'.format('/admin/client/client/{}/change/'.format(client.user.id)))
        else:
            messages.append('חשבון לקוח קיים')
            messages.append('<a href="{}" target="_blank">לחץ כאן לעריכה</a>'.format('/admin/client/client/{}/change/'.format(client.user.id)))
        message_content_html = '''
לקוח יקר, תודה על הצטרפותך לממשק הדיגיטלי שלנו! <br>
קישור לאתר - https://www.ms-global.co.il/ <br>
לוחצים על המנעול בחלק העליון של האתר ומזינים פרטים <br>
שם משתמש: {{ newUsername }} <br>
סיסמא: {{ newPass }}
        '''
        message_content_html = message_content_html.replace('{{ newUsername }}', user.username)
        message_content_html = message_content_html.replace('{{ newPass }}', newPass)
        message_content = message_content_html.replace('<br>', "‏‎\n\r")
        
        return render(request, 'create_client_user.html', context={
            'messages': messages,
            'store_types': ClientType.objects.all(),
            'newUsername': user.username,
            'newPass': newPass,
            'message_content': message_content,
            'message_content_html': message_content_html,
        })
    return render(request, 'create_client_user.html', context={
        'messages': messages,
        'store_types': ClientType.objects.all(),
    })

@api_view(['GET'])
def get_all_users_by_admin(request):
    if request.user.is_superuser:
        clients = Client.objects.all().select_related('user')
        data = [{'id':client.pk, 'username':client.user.username, 'businessName':client.businessName,'email': client.email, 'privateCompany': client.privateCompany, } for client in clients]
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'status':'error'}, status=status.HTTP_403_FORBIDDEN)

# Create your views here.
@api_view(['GET', 'POST'])
#@permission_classes((IsAuthenticated, ))
def whoAmI(request):
    if request.user and request.user.id != None:
        # if request.method == 'POST':
        #     username = request.data.get('username', None)
            
        #     old_password = request.data.get('old_password', None)
        #     new_password = request.data.get('new_password', None)
        #     messages = ''
        #     if old_password != '' and new_password != '':
        #         if request.user.check_password(old_password):
        #             request.user.set_password(new_password)
        #             request.user.save()
        #             messages += 'Password changed successfully'
        #         else:
        #             return JsonResponse({
        #                 'status':'warning',
        #                 'detail':'Old password is incorrect'
        #             })
            
            
        #     # if the user try to change the username, make sure it is unique
        #     if(username != request.user.username):
        #         if User.objects.filter(username=username).exists():
        #             return JsonResponse({
        #                 'status':'warning',
        #                 'detail':'Username already exists'
        #             })
        #     #request.user.first_name = first_name
        #     #request.user.last_name = last_name
            
        #     request.user.username = username
        #     try :
        #         request.user.save()
        #         messages += 'Profile updated successfully'
        #     except Exception as e:
        #         return JsonResponse({
        #             'status':'warning',
        #             'detail':e.args[0]
        #         })
        # elif request.method == 'GET':
        #     pass
        return JsonResponse(get_user_info(request.user), safe=False)
    else:
        return JsonResponse({
            'status':'not logged in',
            #'first_name': request.user.first_name,
            #'last_name':request.user.last_name,
            'campains': [],
            
            })
    return JsonResponse({'status':'error', 'detail':'user not loged in'})

# def get_user_info(user):
#     if user.id != None and user.client:
#         return {
#             'status':'success',
#             #'first_name': request.user.first_name,
#             #'last_name':request.user.last_name,
#             'username':user.username,
#             'email' :user.client.email,
#             'privateCompany': user.client.privateCompany,
#             'businessName': user.client.businessName,
#             'is_superuser': user.is_superuser,
#             'campains': get_user_campains_serializer_data(user),
#             'show_prices': user.client.show_prices,
#         }
#     return {}

@api_view(['POST'])
@permission_classes((AllowAny, ))
def userLogEntryView(request):
    
    if request.method == 'POST':
        affected_rows = []
        device=request.COOKIES['device']
        data = request.data
        i = 0
        uid = data.get('uid', None)
        session_logger = get_active_session_logger(uid, device, request.user)
        for d in data['logs']:
            entry = UserLogEntry.objects.create(
                action=d['a'],
                extra=d,
                timestamp=d['timestemp']
            )
            session_logger.logs.add(entry)
            affected_rows.append([entry.id, entry.action, entry.timestamp])
        return JsonResponse({'status':'success'
                             ,'rows':affected_rows})
        
        
import uuid
def get_active_session_logger(uid, device, user):
    try:
        my_uid=  str(uuid.UUID(uid))
    except:
        my_uid = str(uuid.uuid4())
    ret , created= UserSessionLogger.objects.get_or_create(uid=my_uid, device=device, user_id=user.id, is_active=True)
    print('get_active_session_logger: ', ret,' created: ', created)
    return ret