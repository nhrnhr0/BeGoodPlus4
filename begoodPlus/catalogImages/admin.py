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
from PIL import Image
import requests
from io import BytesIO

from core.utils import url_to_edit_object

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
    list_display = ('id', 'show_sizes_popup','render_thumbnail','title','cost_price_dis','client_price_dis','recomended_price_dis','get_albums','cost_price','client_price','recomended_price','date_created', 'date_modified','barcode', 'show_sizes_popup')
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
        'title', 'description','sizes__size', 'colors__name','provides__name',
        'barcode', 'cost_price', 'client_price', 'recomended_price', 'albums__title', 'show_sizes_popup',
        ('packingTypeProvider__name', 'שיטת אריזה מהספק'), ('packingTypeClient__name', 'שיטת אריזה ללקוח'),'date_modified', 'can_tag')

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
        value_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        title_style.alignment = alignment_center
        value_style.alignment = alignment_center
        title_style.font.bold = True
        #writer.writerow(['id', 'title', 'description', 'cimage', 'cost_price', 'packingTypeClient'])
        i = 1
        ws.write(0, 0, 'id',title_style)
        ws.write(0, 1, 'כותרת',title_style)
        ws.write(0, 2, 'תיאור',title_style)
        ws.write(0, 3, 'מחיר עלות ללא מע"מ',title_style)
        ws.write(0, 4, 'מחיר חנות ללא מע"מ',title_style)
        ws.write(0, 5, 'מחיר לקוח פרטי ללא מע"מ',title_style)
        ws.write(0, 6, 'ספק',title_style)
        ws.write(0, 7, 'מקט אצל הספק',title_style)
        
        for value in queryset:
            vals = [value.id, value.title, value.description, value.cost_price, value.client_price, value.recomended_price]
            ws.write(i, 0, vals[0],value_style)
            ws.write(i, 1, vals[1],value_style)
            ws.write(i, 2, vals[2],value_style)
            ws.write(i, 3, vals[3],value_style)
            ws.write(i, 4, vals[4],value_style)
            ws.write(i, 5, vals[5],value_style)
            provider_offset = 6
            providers_with_makat = []
            for catalogImageDetail in value.detailTabel.all():
                provider_name = catalogImageDetail.provider.name
                provider_makat = catalogImageDetail.providerMakat
                providers_with_makat.append(provider_name)
                ws.write(i, provider_offset, provider_name,value_style)
                provider_offset += 1
                ws.write(i, provider_offset, provider_makat,value_style)
                provider_offset += 1
            all_providers = value.providers.all()
            # filter out the providers that are in the catalogImageDetail
            all_providers = all_providers.exclude(name__in=providers_with_makat)
            for provider in all_providers:
                ws.write(i, provider_offset, provider.name,value_style)
                provider_offset += 1
                ws.write(i, provider_offset, '-',value_style)
                provider_offset += 1
            
            '''
            url = vals[3]
            response = requests.get(url)
            img = Image.open(BytesIO(response.content))
            r, g, b, a = img.split()
            img = Image.merge("RGB", (r, g, b))
            img.save('imagetoadd.bmp')
            ws.insert_bitmap('imagetoadd.bmp', i, 6)
            '''
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