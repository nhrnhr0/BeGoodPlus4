from django.contrib import admin
from advanced_filters.admin import AdminAdvancedFiltersMixin
from django.http.response import HttpResponse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy  as _
from django.urls import reverse
import csv
import io
from django.http import FileResponse
from xlwt.Style import XFStyle
from catalogAlbum.models import ThroughImage
import xlwt

from .models import CatalogImage
class tableInline(admin.TabularInline):
    model = CatalogImage.detailTabel.through
    #fields = ['',]
    #fields = ['id', 'provider']
    #readonly_fields = ['provider']
    fields = ['id', 'provider','dis_colors', 'dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price', 'providerMakat']
    readonly_fields = ['id','provider', 'dis_colors', 'dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price', 'providerMakat']
    extra=0
    def providerMakat(self, instance ):
        print(instance)
        if instance and instance.catalogimagedetail_id:
            return instance.catalogimagedetail.providerMakat

    def price_component(buy, sell):
        prcent = ((buy / sell) - 1)*100
        precent_clr ="green" if prcent>0 else "red"
        return mark_safe(f'<div style="direction: rtl;">{buy:.2f}₪ <span style="color:{precent_clr}">({prcent:.2f}%)</span></div>');#.format(buy, prcent))
    def provider(self, instance):
        if instance and instance.catalogimagedetail_id:
            return instance.catalogimagedetail.provider
        return 'none'
    provider.short_description = _('provider')
    def dis_colors(self, instance):
        if instance and instance.catalogimagedetail_id:
            clrs = instance.catalogimagedetail.colors
            ret = ''
            for c in clrs.all():
                ret += c.name + ', '
            return ret
    dis_colors.short_description = _('colors')
    
    def dis_sizes(self, instance):
        if instance and instance.catalogimagedetail_id:
            sizes = instance.catalogimagedetail.sizes
            ret = ''
            for s in sizes.all():
                ret += s.size + ', '
            return ret
    dis_sizes.short_description = _('sizes')
    
    def dis_cost_price(self, instance):
        if instance and instance.catalogimagedetail_id:
            return mark_safe(f'<div style="font-weight: bold;">{instance.catalogimagedetail.cost_price}₪<div>')
    dis_cost_price.short_description = _('cost price')

    def dis_client_price(self, instance):
        if instance and instance.catalogimagedetail_id:
            comp = tableInline.price_component(instance.catalogimagedetail.client_price, instance.catalogimagedetail.cost_price)
            return comp#instance.catalogimagedetail.client_price
    dis_client_price.short_description = _('client price')
    
    def dis_recomended_price(self, instance):
        if instance and instance.catalogimagedetail_id:
            comp = tableInline.price_component(instance.catalogimagedetail.recomended_price, instance.catalogimagedetail.client_price)
            return comp
    dis_recomended_price.short_description = _('recomended price')

class albumsInline(admin.TabularInline):
    model = ThroughImage
    #fields = ['id','provider','dis_colors','dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    #readonly_fields = ['id','provider','dis_colors', 'dis_sizes', 'dis_cost_price', 'dis_client_price', 'dis_recomended_price']
    extra=1
# Register your models here.
class CatalogImageAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('id', 'render_thumbnail', 'link_copy','title', 'barcode','cost_price_dis','client_price_dis','recomended_price_dis','get_albums','cost_price','client_price','recomended_price')
    list_editable = ('cost_price','client_price','recomended_price')
    list_display_links = ('title',)
    actions = ['download_images_csv',]
    inlines = (albumsInline, tableInline)#
    readonly_fields = ('id', 'render_thumbnail', 'render_image',)
    search_fields = ('title','description', 'barcode', 'detailTabel__providerMakat')
    list_filter = ('albums', 'providers','sizes','colors',)
    filter_horizontal = ('colors', 'sizes','providers',)#'detailTabel'
    list_per_page = 50
    exclude = ('detailTabel',)
    advanced_filter_fields = (
        'title', 'description','sizes__size', 'colors__name','provides__name')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('albums', 'detailTabel')
        

    def download_images_csv(modeladmin, request, queryset):
        buffer = io.BytesIO()
        wb = xlwt.Workbook()
        file_name='data'
        ws = wb.add_sheet('sheet1',cell_overwrite_ok=True)
        ws.cols_right_to_left = True
        title_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        title_style.alignment = alignment_center
        
        title_style.font.bold = True
        #writer.writerow(['id', 'title', 'description', 'cimage', 'cost_price', 'packingTypeClient'])
        i = 1
        ws.write(0, 0, 'id',title_style)
        ws.write(0, 1, 'title',title_style)
        ws.write(0, 2, 'description',title_style)
        ws.write(0, 3, 'cimage',title_style)
        ws.write(0, 4, 'cost_price',title_style)
        ws.write(0, 5, 'packingTypeClient',title_style)
        for value in queryset:
            vals = [value.id, value.title, value.description, 'https://res.cloudinary.com/ms-global/image/upload/' + value.cimage, value.cost_price, str(queryset.all().first().packingTypeClient)]
            ws.write(i, 0, vals[0],title_style)
            ws.write(i, 1, vals[1],title_style)
            ws.write(i, 2, vals[2],title_style)
            ws.write(i, 3, vals[3],title_style)
            ws.write(i, 4, vals[4],title_style)
            ws.write(i, 5, vals[5],title_style)
            i += 1
        wb.save(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=file_name + '.xls')
        
    
    
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