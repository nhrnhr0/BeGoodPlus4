from django.contrib import admin
from advanced_filters.admin import AdminAdvancedFiltersMixin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy  as _
from django.urls import reverse

from catalogAlbum.models import ThroughImage

from .models import CatalogImage
class tabelInline(admin.TabularInline):
    model = CatalogImage.detailTabel.through
    fields = ['id','provider','dis_colors','dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    readonly_fields = ['id','provider','dis_colors', 'dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    extra=0

    def price_component(buy, sell):
        prcent = ((buy / sell) - 1)*100
        precent_clr ="green" if prcent>0 else "red"
        return mark_safe(f'<div style="direction: rtl;">{buy:.2f}₪ <span style="color:{precent_clr}">({prcent:.2f}%)</span></div>');#.format(buy, prcent))
    def provider(self, instance):
        return instance.catalogimagedetail.provider
    provider.short_description = _('provider')
    def dis_colors(self, instance):
        clrs = instance.catalogimagedetail.colors
        ret = ''
        for c in clrs.all():
            ret += c.name + ', '
        return ret
    dis_colors.short_description = _('colors')
    
    def dis_sizes(self, instance):
        sizes = instance.catalogimagedetail.sizes
        ret = ''
        for s in sizes.all():
            ret += s.size + ', '
        return ret
    dis_sizes.short_description = _('sizes')
    
    def dis_cost_price(self, instance):
        return mark_safe(f'<div style="font-weight: bold;">{instance.catalogimagedetail.cost_price}₪<div>')
    dis_cost_price.short_description = _('cost price')

    def dis_client_price(self, instance):
        comp = tabelInline.price_component(instance.catalogimagedetail.client_price, instance.catalogimagedetail.cost_price)
        return comp#instance.catalogimagedetail.client_price
    dis_client_price.short_description = _('client price')
    
    def dis_recomended_price(self, instance):
        comp = tabelInline.price_component(instance.catalogimagedetail.recomended_price, instance.catalogimagedetail.client_price)
        return comp
    dis_recomended_price.short_description = _('recomended price')
    
class albumsInline(admin.TabularInline):
    model = ThroughImage
    #fields = ['id','provider','dis_colors','dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    #readonly_fields = ['id','provider','dis_colors', 'dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    extra=1
# Register your models here.
class CatalogImageAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('id', 'render_thumbnail', 'title', 'barcode','cost_price_dis','client_price_dis','recomended_price_dis','get_albums','cost_price','client_price','recomended_price')
    list_editable = ('cost_price','client_price','recomended_price')
    list_display_links = ('title',)
    inlines = (tabelInline,albumsInline)
    readonly_fields = ('id', 'render_thumbnail', 'render_image',)
    search_fields = ('title','description')
    list_filter = ('albums', 'providers','sizes','colors',)
    filter_horizontal = ('colors', 'sizes','providers', 'detailTabel')
    list_per_page = 50
    advanced_filter_fields = (
        'title', 'description','sizes__size', 'colors__name','provides__name')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('albums')
        

    def get_albums(self, obj):
        ret = '<ul style="background-color:#ddd;">'
        for a in obj.albums.all():
            ret += f'<li> {CatalogImageAdmin.url_to_edit_object(a)} </li>'
        ret += '</ul>'
        return mark_safe(ret)
        #return ",".join([a.title for a in obj.albums.all()])
    
    def url_to_edit_object(obj):
        url = reverse('admin:%s_%s_change' % (obj._meta.app_label,  obj._meta.model_name),  args=[obj.id] )
        return u'<a href="%s">%s</a>' % (url,  obj.__str__())
admin.site.register(CatalogImage,CatalogImageAdmin)