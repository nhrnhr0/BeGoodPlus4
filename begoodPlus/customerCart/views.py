from django.shortcuts import render
from django.http import JsonResponse
#from urlparse import parse_qs
from urllib.parse import parse_qs
from .serializers import CustomerCartSerializer
from .models import CustomerCart
# Create your views here.
import json
from core.models import Customer
from catalogImages.models import CatalogImage
import datetime
from django.urls import reverse

def json_cart(request, cart):
    ser_context={'request': request}
    data = CustomerCartSerializer(cart, context=ser_context).data
    data['timestemp'] = str(datetime.datetime.now())
    return data

def cart_info(request):
    if request.is_ajax() and request.method == 'POST':
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        cart = customer.get_active_cart()
        data = request.POST['content']
        data = parse_qs(data)
        if 'name' in data:
            cart.name= data['name'][0]
        if 'email' in data:
            cart.email= data['email'][0]
        if 'phone' in data:
            cart.phone= data['phone'][0]
        if 'submited' in data:
            sub = False if data['submited'][0] == 'false' else True
            cart.sumbited = sub
        print('saved cart: ', cart)
        cart.save()

        print('saved cart: ', cart)
        print('name: ', cart.name)
        print('email', cart.email)
        print('phone',cart.phone)
        print('submited', cart.sumbited)

        #ser_context={'request': request}
        #data = CustomerCartSerializer(cart, context=ser_context).data
        #data['timestemp'] = str(datetime.datetime.now())
        response = json_cart(request, cart)
        if sub:
            response['redirect_to'] = reverse('success')
        return JsonResponse(response)
    pass

def cart_view(request):
    customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
    cart = customer.get_active_cart()
    return JsonResponse(json_cart(request, cart))
    
def cart_add(request):
    if request.is_ajax() and request.method == 'POST':
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        cart = customer.get_active_cart()
        data = request.POST['content']
        if not cart.products.filter(pk=data).exists():
            product = CatalogImage.objects.get(pk=data)
            cart.products.add(product)
            cart.save()

        return JsonResponse(json_cart(request, cart))
    pass
def cart_del(request):
    if request.is_ajax() and request.method == 'POST':
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        cart = customer.get_active_cart()
        data = request.POST['content']
        
        product = CatalogImage.objects.get(pk=data)
        cart.products.remove(product)
        cart.save()

        return JsonResponse(json_cart(request, cart))
    pass
'''
def cart_changed(request):
    if request.is_ajax() and request.method == 'POST':
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        data = request.POST['content']
        form_data = parse_qs(data)
        get_if_exist = lambda data, name: form_data[name][0] if name in data else ''
        get_array_if_exist = lambda data, name: form_data[name] if name in data else ''
            
        name = get_if_exist(form_data, 'name')
        phone = get_if_exist(form_data, 'phone')
        email = get_if_exist(form_data, 'email')
        formUUID = get_if_exist(form_data, 'formUUID')
        products = get_array_if_exist(form_data, 'products[]')
        submited = get_if_exist(form_data, 'sumbited')
        if submited == 'True':
            submited = True
        else:
            submited = False
        
        
        cart, cart_created = CustomerCart.objects.distinct().get_or_create(formUUID=formUUID)
        cart.name=name
        cart.phone=phone
        cart.email=email
        cart.sumbited=submited
        cart.products.set(products)
        cart.save()
        customer.carts.add(cart)
        if cart.sumbited == True:
            return JsonResponse({'status':'submited'})


        ser_context={'request': request}
        data = CustomerCartSerializer(cart, context=ser_context)
        return JsonResponse(data.data)

        
        return JsonResponse({'status':'ok'})
    else:
        print('why not post')
'''