from django.contrib.auth.models import User
from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from campains.views import get_user_campains_serializer_data
from client.models import UserSessionLogger

from client.models import UserLogEntry



# Create your views here.
@api_view(['GET', 'POST'])
@permission_classes((IsAuthenticated, ))
def whoAmI(request):
    if request.user and request.user.id != None:

        if request.method == 'POST':
            username = request.data.get('username', None)
            
            old_password = request.data.get('old_password', None)
            new_password = request.data.get('new_password', None)
            messages = ''
            if old_password != '' and new_password != '':
                if request.user.check_password(old_password):
                    request.user.set_password(new_password)
                    request.user.save()
                    messages += 'Password changed successfully'
                else:
                    return JsonResponse({
                        'status':'warning',
                        'detail':'Old password is incorrect'
                    })
            
            
            # if the user try to change the username, make sure it is unique
            if(username != request.user.username):
                if User.objects.filter(username=username).exists():
                    return JsonResponse({
                        'status':'warning',
                        'detail':'Username already exists'
                    })
            #request.user.first_name = first_name
            #request.user.last_name = last_name
            
            request.user.username = username
            try :
                request.user.save()
                messages += 'Profile updated successfully'
            except Exception as e:
                return JsonResponse({
                    'status':'warning',
                    'detail':e.args[0]
                })
        elif request.method == 'GET':
            pass
        return JsonResponse(get_user_info(request.user), safe=False)
        
    return JsonResponse({'status':'error', 'detail':'user not loged in'})

def get_user_info(user):
    if user.id != None:
        return {
            'status':'success',
            #'first_name': request.user.first_name,
            #'last_name':request.user.last_name,
            'username':user.username,
            'email' :user.client.email,
            'privateCompany': user.client.privateCompany,
            'businessName': user.client.businessName,
            'is_superuser': user.is_superuser,
            'campains': get_user_campains_serializer_data(user),
            'show_prices': user.client.show_prices,
        }
    return {}

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
    my_uid=  str(uuid.UUID(uid))
    ret , created= UserSessionLogger.objects.get_or_create(uid=my_uid, device=device, user_id=user.id, is_active=True)
    print('get_active_session_logger: ', ret,' created: ', created)
    return ret