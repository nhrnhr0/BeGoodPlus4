from django.shortcuts import render

# Create your views here.


def order_form(request):
    ret = render(request, 'index.html',{})
    return ret
    
def order_form2(request):
    ret = render(request, 'order.html', {})
    return ret
    
def order_form3(request):
    ret = render(request, 'order2.html', {})
    return ret

#def catalog_view(request):
#    return render(request, 'catalog.html',{})
    
    
def landing_page_view(request):
    return render(request, 'landing_page.html', {})
    
def my_logo_wrapper_view(request):
    return render(request, 'my_logo_wrapper.html', {})

from django.shortcuts import get_object_or_404
from catalogAlbum.models import CatalogAlbum
def catalog_page(request,hierarchy= None):
    category_slug = hierarchy.split('/')
    category_queryset = list(CatalogAlbum.objects.all())
    all_slugs = [ x.slug for x in category_queryset ]
    parent = None
    for slug in category_slug:
        if slug in all_slugs:
            parent = get_object_or_404(CatalogAlbum,slug=slug, parent=parent)
        else:
            pass
            #instance = get_object_or_404(Post, slug=slug)
            #breadcrumbs_link = instance.get_cat_list()
            #category_name = [' '.join(i.split('/')[-1].split('-')) for i in breadcrumbs_link]
            #breadcrumbs = zip(breadcrumbs_link, category_name)
            #return render(request, "postDetail.html", {'instance':instance,'breadcrumbs':breadcrumbs})
    res = {
        'album_title': parent.title,
        'images': parent.images.values().order_by('throughimage__weight'),
        'sub_categories':category_queryset,
    }
    return render(request,'catalog_page.html',res)
    
    
def catalog_page2(request,hierarchy= None):
    category_slug = hierarchy.split('/')
    category_queryset = list(CatalogAlbum.objects.all())
    all_slugs = [ x.slug for x in category_queryset ]
    parent = None
    for slug in category_slug:
        if slug in all_slugs:
            parent = get_object_or_404(CatalogAlbum,slug=slug, parent=parent)
        else:
            pass
            #instance = get_object_or_404(Post, slug=slug)
            #breadcrumbs_link = instance.get_cat_list()
            #category_name = [' '.join(i.split('/')[-1].split('-')) for i in breadcrumbs_link]
            #breadcrumbs = zip(breadcrumbs_link, category_name)
            #return render(request, "postDetail.html", {'instance':instance,'breadcrumbs':breadcrumbs})
    res = {
        'album_title': parent.title,
        'images': parent.images.values().order_by('throughimage__weight'),
        'sub_categories':category_queryset,
    }
    return render(request,'catalog_page2.html',res)

'''
def catalog_page(request, *args, **kwargs):
    from catalogAlbum.models import CatalogAlbum
    slug = kwargs['slug']
    album = get_object_or_404(CatalogAlbum.objects.prefetch_related('images'), slug=slug)
    ret = {'album_title': album.title,
            'images': album.images.values().order_by('throughimage__weight'),
    }
    
    return render(request, 'catalog_page.html', {'context':ret})
    
'''