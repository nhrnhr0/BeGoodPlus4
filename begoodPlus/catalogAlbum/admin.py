from django import forms
from django.contrib import admin

from catalogAlbum.models import CatalogAlbum, ThroughImage, TopLevelCategory
from django.utils.translation import gettext_lazy  as _

from catalogImages.models import CatalogImage
# from adminsortable.admin import  SortableTabularInline


class CatalogImageInlineFormset(forms.BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        super(CatalogImageInlineFormset, self).__init__(*args, **kwargs)
        self.queryset = self.queryset.select_related("catalogImage", "catalogAlbum")

class CatalogImageInline(admin.TabularInline):
    model = CatalogAlbum.images.through
    formset = CatalogImageInlineFormset
    extra = 0
    fields = ('image_order', 'catalogImage', 'catalogAlbum')
    readonly_fields = ('catalogAlbum',)
    # catalogImage as autocomplete
    autocomplete_fields = ('catalogImage',)

from django.db.models import Count, fields

class TopLevelCategoryAdmin(admin.ModelAdmin):
    list_display = ('image_display', 'name', 'my_order')
    readonly_fields= ('image_display',)
    list_editable = ('my_order',)
    list_display_links = ('name',)
    ordering = ('my_order',)
admin.site.register(TopLevelCategory, TopLevelCategoryAdmin)

class CatalogAlbumAdmin(admin.ModelAdmin):
    inlines = (CatalogImageInline,)
    list_display = ('title','topLevelCategory', 'album_order', 'render_cimage_thumbnail', 'slug' ,'related_images_count','is_public',)#'get_absolute_url')
    readonly_fields = ('related_images_count','render_cimage_thumbnail',)
    #readonly_fields = ('get_absolute_url',)
    list_editable = ('album_order',)
    prepopulated_fields = {'slug': ('title',),}
    actions  = ['make_public','make_private']
    fields= ('render_cimage_thumbnail','image','is_public','topLevelCategory','title','slug','album_order','description','fotter','keywords',)
    
    
    def make_public(modeladmin, request, queryset):
        queryset.update(is_public=True)
    make_public.short_description = _('Mark selected albums as public')    
    def make_private(modeladmin, request, queryset):
        queryset.update(is_public=False)
    make_private.short_description = _('Mark selected albums as private')    
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.prefetch_related('images')
        qs = qs.select_related('topLevelCategory')
        # Add cumulative product count
        qs = qs.annotate(image_count=Count('images'))
        return qs
        
    def related_images_count(self, instance):
        return instance.image_count
    related_images_count.short_description = _('Images count')

admin.site.register(CatalogAlbum,CatalogAlbumAdmin)