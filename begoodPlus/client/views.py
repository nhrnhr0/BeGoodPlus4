from django.contrib.auth.models import User
from django.shortcuts import render
from django.http.response import JsonResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes



# Create your views here.
@api_view(['GET', 'POST'])
@permission_classes((IsAuthenticated, ))
def whoAmI(request):
    if request.user and request.user.id != None:

        if request.method == 'POST':
            username = request.data.get('username', None)
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
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
            request.user.first_name = first_name
            request.user.last_name = last_name
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
        return JsonResponse({
            'status':'success',
            'first_name': request.user.first_name,
            'last_name':request.user.last_name,
            'username':request.user.username,
        })
        
    return JsonResponse({'status':'error', 'detail':'user not loged in'})
