from django.shortcuts import render, HttpResponse
from django.contrib.sessions.models import Session
from django.db import IntegrityError

# Create your views here.
def updateUserTaskView(request, *args, **kwargs):
    print('request', request)
    
from .models import ContactFormTask, UserTask
import json
from django.core.exceptions import ObjectDoesNotExist
from .serializers import UserTaskSerializer, ProductsTaskSerializer
from django.db import IntegrityError


def get_session_key(request):
    if not request.session.session_key:
        request.session.save()
    return request.session.session_key

from django.db import models

def getUserTasksView(request, *args, **kwargs):
    
    session = get_session_key(request)
    tasks = UserTask.objects.filter(session=session, submited=False).values('task_name').distinct().order_by('modified_date')
    ser_context={'request': request}
    serializer = UserTaskSerializer(tasks,context=ser_context, many=True)
    #content = JSONRenderer().render(serializer.data)
    data = json.dumps(serializer.data)
    #context = {'catalogAlbums': albums,'catalogAlbumData':data}
    #context = {'tasks':data}
    #data = {data}
    #print('getUserTasksView', data)
    #context = {'catalogAlbums': albums,}
    return HttpResponse(data,content_type="application/json")

from .models import ProductsTask
from catalogImages.models import CatalogImage
def updateProductsFormUserTaskView(request, *args, **kwargs):
    if request.is_ajax() and request.method == "POST":
        task_id = request.POST.get('task_id', None)
        task_name = request.POST.get('taskName', None)
        name = request.POST.get('name', None)
        phone = request.POST.get('phone', None)
        email = request.POST.get('email', None)
        products = request.POST.getlist('products[]',None)
        submited = request.POST.get('submited', None)
        session =  get_session_key(request)


        if submited == 'true':
            submited = True
        else:
            submited = False

        if task_id and task_id != '-1':
            try:
                task = ProductsTask.objects.get(pk=task_id)
            except:
                task, created = ProductsTask.objects.get_or_create(session=session, task_name=task_name, submited=submited)
            #task.name=name
            #task.email=email
            #task.phone=phone
            #task.submited = submited
            
        else:
            task, created = ProductsTask.objects.get_or_create(session=session, task_name=task_name, submited=submited)
            task_id = task.id
        task.name=name
        task.email=email
        task.phone=phone
        task.submited = submited
        for product in products:
            try:
                if task.products.filter(pk=product).exists() == False:
                    obj = CatalogImage.objects.get(pk=product)
                    task.products.add(obj)
            except:
                pass
            pass
        old_tasks = ProductsTask.objects.filter(session=session,task_name=task_name, submited=False).exclude(pk=task_id)
        print('delete old tasks ', old_tasks)
        old_tasks.delete()
        #task, created = ContactFormTask.objects.get_or_create(task_name=task_name,session=session, submited=False)
        task.save()
        if task.submited == False and submited == True:
            print('the form is submited', task.id)

        taskProductsCount= task.products.all().count()
        if taskProductsCount == 0:
            task.delete()
            task_id=-1

        if submited:
            task_id=-1
        #return HttpResponse(json.dumps({'task_id': -1}), content_type="application/json")
        return  HttpResponse(json.dumps({'task_id': task_id}), content_type="application/json")
        #return getUserCartView(request, *args,**kwargs)
        
'''
        task, created = ProductsTask.objects.get_or_create(task_name=task_name, session=session)
        task.name=name
        task.email=email
        task.phone=phone
        for product in products:
            try:
                if task.products.filter(pk=product).exists() == False:
                    obj = CatalogImage.objects.get(pk=product)
                    task.products.add(obj)
            except:
                pass
        
        task.save()
        
        #print(created, task.id,task)
        

        #return HttpResponse(json.dumps({'task_id': task.id}), content_type="application/json")
        return getUserCartView(request, *args,**kwargs)
'''
def getUserCartView(request, *args, **kwargs):
    session = get_session_key(request)
    cart = ProductsTask.objects.filter(session=session, submited=False).latest('modified_date')
    ser_context={'request': request}
    serializer = ProductsTaskSerializer(cart,context=ser_context)
    if cart.products.count() == 0:
        data = {'id': -1}
    else:
        data = json.dumps(serializer.data)

    
    return HttpResponse(data,content_type="application/json")
    
def delUserLikedProductView(request, *args,**kwargs):
    if request.method == "POST":
        session = get_session_key(request)
        #cart = ProductsTask.objects.filter(session=session).first()
        cartId = request.POST.get('cartId', None)
        prodId = request.POST.get('prodId', None)
        cart = ProductsTask.objects.get(pk=cartId)
        product = CatalogImage.objects.get(pk=prodId)
        cart.products.remove(product)
        return getUserCartView(request, *args, **kwargs)
    


def updateContactFormUserTaskView(request,*args, **kwargs):
    if request.is_ajax() and request.method == "POST":
        task_id = request.POST.get('task_id', None)
        task_name = request.POST.get('taskName', None)
        name = request.POST.get('name', None)
        phone = request.POST.get('phone', None)
        email = request.POST.get('email', None)
        submited = request.POST.get('submited', None)
        message = request.POST.get('message', None)
        url = request.META['HTTP_REFERER']
        session =  get_session_key(request)
        if submited == 'true':
            submited = True
        else:
            submited = False

        if task_id and task_id != '-1':
            task = ContactFormTask.objects.get(pk=task_id)
            task.name=name
            task.email=email
            task.phone=phone
            task.message=message
            task.submited = submited
            task.url=url

        else:
            task, created = ContactFormTask.objects.get_or_create(session=session, task_name=task_name, submited=submited)
            task_id = task.id
            task.name=name
            task.email=email
            task.phone=phone
            task.message=message
            task.submited = submited
            task.url=url

        old_tasks = ContactFormTask.objects.filter(session=session,task_name=task_name, submited=False).exclude(pk=task_id)
        print('delete old tasks ', old_tasks)
        old_tasks.delete()
        #task, created = ContactFormTask.objects.get_or_create(task_name=task_name,session=session, submited=False)
        task.save()
        if task.submited == False and submited == True:
            print('the form is submited', task.id)


        if submited:
            return HttpResponse(json.dumps({'task_id': -1}), content_type="application/json")
        return HttpResponse(json.dumps({'task_id': task.id}), content_type="application/json")
    pass