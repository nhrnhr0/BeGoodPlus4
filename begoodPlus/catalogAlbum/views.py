from django.shortcuts import redirect, render
from django.urls.base import reverse
from clientApi.serializers import AlbumClientApi

# Create your views here.
from catalogAlbum.models import CatalogAlbum, TopLevelCategory
from .serializers import CatalogAlbumSerializer, CatalogAlbumSlimSerializer, TopLevelCategorySerializer
from django.http import JsonResponse

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.renderers import JSONRenderer
@api_view(['GET'])
def get_catalog_albums(request, id=None):
    if not id:
        albums = CatalogAlbum.objects.filter(is_public=True,is_campain=False,).order_by('topLevelCategory','album_order').select_related('topLevelCategory')
        serializer = CatalogAlbumSlimSerializer(albums, many=True)
    else: 
        album = CatalogAlbum.objects.get(id=id)
        serializer = CatalogAlbumSlimSerializer(album)
        
    return JsonResponse(serializer.data, safe=False)
@api_view(['GET'])
def get_main_categories(request):
    qs = TopLevelCategory.objects.all().prefetch_related('albums')
    ser = TopLevelCategorySerializer(qs, many=True)
    data = ser.data
    return JsonResponse(data, safe=False)
@api_view(['GET'])
def get_albums(request):
    ids = request.GET.get('ids').split(',')
    albums = CatalogAlbum.objects.filter(id__in=ids)
    data = AlbumClientApi(albums, many=True).data
    return JsonResponse(data, safe=False)

class CatalogAlbumViewSet(viewsets.ModelViewSet):
    queryset = CatalogAlbum.objects.all()
    serializer_class = CatalogAlbumSerializer
from django.db.models.query import QuerySet
from pprint import PrettyPrinter

def dprint(object, stream=None, indent=1, width=80, depth=None):
    """
    A small addition to pprint that converts any Django model objects to dictionaries so they print prettier.

    h3. Example usage

        >>> from toolbox.dprint import dprint
        >>> from app.models import Dummy
        >>> dprint(Dummy.objects.all().latest())
         {'first_name': u'Ben',
          'last_name': u'Welsh',
          'city': u'Los Angeles',
          'slug': u'ben-welsh',
    """
    # Catch any singleton Django model object that might get passed in
    if getattr(object, '__metaclass__', None):
        if object.__metaclass__.__name__ == 'ModelBase':
            # Convert it to a dictionary
            object = object.__dict__
    
    # Catch any Django QuerySets that might get passed in
    elif isinstance(object, QuerySet):
        # Convert it to a list of dictionaries
        object = [i.__dict__ for i in object]
        
    # Pass everything through pprint in the typical way
    printer = PrettyPrinter(stream=stream, indent=indent, width=width, depth=depth)
    printer.pprint(object)

import json
import datetime


# TODO: solve this

'''
def catalog_timer(request, *args, **wkargs):
    return None
    timer,created = MySettings.objects.get_or_create(name='discount_counter')
    if timer.value == None or timer.value == '':
        time = timer.value
        try:
            time = datetime.datetime.strptime(time, '%S-%M-%H-%d-%y')
        except:
            time = renew_timer_date()
            timer.value = str(time)
            timer.save()
    myTime = datetime.datetime.strptime(str(timer.value), '%S-%M-%H-%d-%y')
    currTime = datetime.datetime.strptime(datetime.datetime.now(), '%S-%M-%H-%d-%y')

    diffrence = myTime - currTime
    if diffrence.days >= 1:
        time = renew_timer_date()
        timer.value = str(datetime.datetime.strptime(time, '%S-%M-%H-%d-%y'))
        timer.save()


    return JsonResponse(json.dump(timer.value))

def renew_timer_date():
    time = datetime.datetime.now() + datetime.timedelta(days=3) 
    time = datetime.strftime(str(time), '%S-%M-%H-%d-%y')
    return time
'''
from rest_framework.renderers import JSONRenderer

def catalogView_api(request, *args, **wkrags):
    print('catalogView_api start')
    #update_catalogAlbum_timers2()
    albums = CatalogAlbum.objects.prefetch_related('images').all()
    ser_context={'request': request}
    serializer = CatalogAlbumSerializer(albums,context=ser_context, many=True)
    data = json.dumps(serializer.data)
    #data = JSONRenderer().render(serializer.data)

    context = {'catalogAlbumData':data,}
    print('catalogView_api end')
    return JsonResponse(context)
    #return render(request, 'catalog2.html', context=context)

from django.db.models import Max

#.annotate(max_weight=Max('throughimage__image_order')).order_by('-max_weight').all()#.order_by("throughimage__image_order")
    #albums = albums.order_by('id', 'throughimage__image_order')
    #albums.images.order_by('throughimage__image_order')
    
    
#def catalogView2(request, *args, **wkargs):
#    print('catalogView2 start')
#    albums = CatalogAlbum.objects.prefetch_related('images')
#    context = {'albums':albums}
#    print('catalogView2 end')
#    return render(request, 'catalog2.html', context=context)


from catalogLogos.models import CatalogLogo
from core.forms import FormBeseContactInformation
from core.models import BeseContactInformation, Customer
import uuid
'''
def catalogView(request, *args, **kwargs):
    print('catalogView start')
    if request.method == 'POST':
        print('post to catalogView')
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        phone = request.POST.get('phone', '')
        message = request.POST.get('message', '')
        url = request.POST.get('url') or 'catalog'
        sumbited = True
        formUUID = uuid.uuid4()
        obj = BeseContactInformation.objects.create(  name=name
                                                ,phone=phone
                                                ,email=email
                                                ,message=message
                                                ,url=url
                                                ,sumbited=sumbited
                                                ,formUUID=formUUID)
        obj.save()
        print(obj)
        customer,customer_created  = Customer.objects.get_or_create(device=request.COOKIES['device'])
        customer.contact.add(obj)
        return redirect(reverse('success'))
    albums = CatalogAlbum.objects.prefetch_related('images')
    logos = CatalogLogo.objects.all()
    context = {'albums':albums,
               'logos': logos}
    print('catalogView end')
    return render(request, 'catalog.html', context=context)
'''