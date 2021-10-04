from django.shortcuts import render

# Create your views here.
from catalogAlbum.models import CatalogAlbum
from .serializers import CatalogAlbumSerializer
from django.http import JsonResponse

from rest_framework import viewsets
from rest_framework.renderers import JSONRenderer

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

from mySettings.models import MySettings

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
def catalogView(request, *args, **wkargs):
    print('catalogView start')
    albums = CatalogAlbum.objects.prefetch_related('images')
    logos = CatalogLogo.objects.all()
    context = {'albums':albums,
               'logos': logos}
    print('catalogView end')
    return render(request, 'catalog.html', context=context)
