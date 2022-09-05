from django import forms
from django.contrib import admin

from catalogAlbum.models import CatalogAlbum, ThroughImage, TopLevelCategory
from django.utils.translation import gettext_lazy  as _

from catalogImages.models import CatalogImage
from adminsortable.admin import (SortableAdmin, SortableTabularInline)


class CatalogImageInlineFormset(forms.BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        super(CatalogImageInlineFormset, self).__init__(*args, **kwargs)
        self.queryset = self.queryset.select_related("catalogImage", "catalogAlbum")

class CatalogImageInline(SortableTabularInline):
    model = CatalogAlbum.images.through
    formset = CatalogImageInlineFormset
    extra = 0
    fields = ('image_order', 'catalogImage', 'catalogAlbum')
    readonly_fields = ('image_order','catalogImage', 'catalogAlbum')

from mptt.admin import MPTTModelAdmin
from mptt.admin import DraggableMPTTAdmin
from django.db.models import Count, fields

class TopLevelCategoryAdmin(admin.ModelAdmin):
    list_display = ('image_display', 'name', 'my_order')
    readonly_fields= ('image_display',)
    list_editable = ('my_order',)
    list_display_links = ('name',)
    ordering = ('my_order',)
admin.site.register(TopLevelCategory, TopLevelCategoryAdmin)

class CatalogAlbumAdmin(SortableAdmin, DraggableMPTTAdmin):
    inlines = (CatalogImageInline,)
    list_display = ('tree_actions','indented_title','topLevelCategory', 'render_cimage_thumbnail', 'slug' ,'related_images_count','is_public','is_campain')#'get_absolute_url')
    readonly_fields = ('related_images_count',)
    #readonly_fields = ('get_absolute_url',)
    #list_editable = ('album_order',)
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
        qs = qs.prefetch_related('images')
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