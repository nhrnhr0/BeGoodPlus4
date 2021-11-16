from django.contrib import admin

from catalogAlbum.models import CatalogAlbum, ThroughImage
from django.utils.translation import gettext_lazy  as _

from catalogImages.models import CatalogImage
from adminsortable.admin import (SortableAdmin, SortableTabularInline)

'''
class CatalogImageInline(admin.TabularInline):
    model = CatalogAlbum.images.through
    ordering = ('weight',)
'''
class CatalogImageInline(SortableTabularInline):
    model =  ThroughImage


from mptt.admin import MPTTModelAdmin
from mptt.admin import DraggableMPTTAdmin
from django.db.models import Count



class CatalogAlbumAdmin(SortableAdmin, DraggableMPTTAdmin):
    inlines = (CatalogImageInline,)
    list_display = ('tree_actions','indented_title','link_copy', 'slug', 'keywords' ,'related_images_count','is_public',)#'get_absolute_url')
    readonly_fields = ('related_images_count',)
    
    #readonly_fields = ('get_absolute_url',)
    prepopulated_fields = {'slug': ('title',),}
    
    def make_public(modeladmin, request, queryset):
        queryset.update(is_public=True)
    make_public.short_description = _('Mark selected albums as public')    
    def make_private(modeladmin, request, queryset):
        queryset.update(is_public=False)
    make_private.short_description = _('Mark selected albums as private')    
    actions  = ['make_public','make_private']
    def get_queryset(self, request):
        qs = super().get_queryset(request)

        # Add cumulative product count
        qs = qs.annotate(image_count=Count('images'))
        return qs
        
    def related_images_count(self, instance):
        return instance.image_count
    related_images_count.short_description = 'Related images (for this specific album)'


'''
class CatalogAlbumAdmin(admin.ModelAdmin):
    inlines = (CatalogImageInline,)
    list_display = ('__str__', 'slug',)#'get_absolute_url')
    #readonly_fields = ('get_absolute_url',)
    prepopulated_fields = {'slug': ('title',),}
'''
admin.site.register(CatalogAlbum,CatalogAlbumAdmin)