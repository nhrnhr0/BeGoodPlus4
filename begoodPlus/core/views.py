from django.shortcuts import render,redirect, HttpResponse
from django.http import JsonResponse
from django.db.models.functions import Greatest
from django.contrib.postgres.search import TrigramSimilarity
from .models import UserSearchData
from django.urls import reverse

# Create your views here.
'''
def json_user_tasks(customer):
    contacts_qs = customer.contact.filter(sumbited=False)
    contacts_task = UserTasksSerializer(contacts_qs, many=True)
    #print(contacts_task.data)
    
    return {'status':'ok','data':contacts_task.data}
def user_tasks(request):
    customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
    return JsonResponse(json_user_tasks(customer))


# TODO: unused, can be deleted
def admin_subscribe_view(request):
    webpush = {"group": 'admin' }
    return render(request, 'adminSubscribe.html',{"webpush":webpush})

 
def mainView(request, *args, **kwargs):
    return render(request, 'newMain.html', {})
'''
from .forms import FormBeseContactInformation
'''
def saveBaseContactFormView(request,next, *args, **kwargs):
    if request.method == "POST":
        form = FormBeseContactInformation(request.POST)
        if form.is_valid():
            form.save()
            print('saveBaseContactFormView')

    return redirect(next)
'''

from django.db.models import Q
import json
from catalogAlbum.models import CatalogAlbum, CatalogImage
from .serializers import SearchCatalogImageSerializer,SearchCatalogAlbumSerializer
from itertools import chain 
from django.db.models import Value,CharField
from catalogAlbum.serializers import CatalogImageSerializer
def get_session_key(request):
    if not request.session.session_key:
        request.session.save()
    return request.session.session_key

#from .tasks import save_user_search
import time
def autocompleteModel(request):
    start = time.time()
    if request.is_ajax():
        q = request.GET.get('q', '')
        
        products_qs = CatalogImage.objects.filter(
            Q(title__icontains=q) | 
            Q(description__icontains=q) |  
            Q(albums__title__icontains=q) |
            Q(albums__keywords__icontains=q)
            ).distinct()


        ser_context={'request': request}
        products = SearchCatalogImageSerializer(products_qs,context=ser_context, many=True)
        session = get_session_key(request)
        
        search_history = UserSearchData.objects.create(session=session, term=q, resultCount=len(products.data))#+ len(mylogos.data)
        search_history.save()
        all = products.data# + mylogos.data
        all = all[0:20]
        context = {'all':all,
                    'q':q,
                    'id': search_history.id}

        
        
        end=time.time() - start
        print('autocompleteModel: ', start-end)
        return JsonResponse(context)

from .models import UserSearchData
from django.contrib.contenttypes.models import ContentType

def autocompleteClick(request):
    print('autocompleteClick')
    if request.method == "POST":
        id = request.POST.get('id')
        my_type = request.POST.get('value[item][data][my_type]')
        content_id = request.POST.get('value[item][data][id]')
        if my_type == 'product':
            content_type = ContentType.objects.get_for_model(CatalogImage)
            obj = CatalogImage.objects.get(pk=content_id)
        elif my_type == 'album':
            content_type = ContentType.objects.get_for_model(CatalogAlbum)
            obj = CatalogAlbum.objects.get(pk=content_id)
        #TODO: add my catalog to saved on click

        
        
        search_data = UserSearchData.objects.get(pk=id)
        search_data.content_object = obj
        search_data.save()
        context = {'status': 'ok',
                    'id':id}
        return JsonResponse(context)
        

from .models import Customer, BeseContactInformation
from .forms import FormBeseContactInformation
import  json
def form_changed(request):
    if request.is_ajax() and request.method == 'POST':
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        data = request.POST['content']
        data = json.loads(data)
        form_data_dict = {}
        for field in data:
            form_data_dict[field["name"]] = field["value"]
        
        name = form_data_dict['name']
        email = form_data_dict['email']
        phone = form_data_dict['phone']
        message = form_data_dict['message']
        formUUID = form_data_dict['formUUID']
        url =  form_data_dict['url']
        sumbited = False if form_data_dict['sumbited'] == '' else True
        obj, created = BeseContactInformation.objects.get_or_create(formUUID=formUUID)
        #print('BeseContactInformation ', created, obj)
        obj.name=name
        obj.email=email
        obj.phone=phone
        obj.message=message
        obj.url=url
        obj.sumbited=sumbited
        obj.save()
        customer.contact.add(obj)
        customer.save()
        response = json_user_tasks(customer)
        '''
        if sumbited:
            response.redirect_to = reverse('success')
            print(response)
        print('form_changed' , response)
        return data
        '''
        if sumbited:
            response['redirect_to'] = reverse('success')
        return JsonResponse(response)
    else:
        print('why not post')

def success_view(request):
    return HttpResponse(render(request, 'success.html', context={}))



def handler404(request, *args, **argv):
    print('handler404')
    response = render(request, '404.html', {})
    response.status_code = 404
    return response


def shareable_product_view(request, prod_id):
    obj = CatalogImage.objects.get(pk=prod_id)
    return render(request, 'share_product.html', context={'obj':obj})
    

def shareable_category_view(request, category_id):
    obj = CatalogAlbum.objects.get(pk=category_id)
    return render(request, 'share_category.html', context={'obj':obj})