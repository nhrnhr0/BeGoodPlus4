from django.contrib import admin
from advanced_filters.admin import AdminAdvancedFiltersMixin
from django.http.response import HttpResponse
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy  as _
from django.urls import reverse
import csv
import io

from inventory.models import PPN
from .models import CatalogImage, CatalogImageVarient
from django.http import FileResponse
from xlwt.Style import XFStyle
from catalogAlbum.models import ThroughImage
import xlwt
from PIL import Image
import requests
from io import BytesIO
from django.conf import settings
from core.utils import url_to_edit_object

class CatalogImageVarientAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    model = CatalogImageVarient
    list_display = ('name',)
    search_fields = ('name',)

admin.site.register(CatalogImageVarient, CatalogImageVarientAdmin)

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

class ppnInline(admin.TabularInline):
    model = PPN
    classes = ['ppn-cls',]
    extra=0

class CatalogImageAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('id', 'render_thumbnail','title', 'has_physical_barcode','barcode', 'cost_price_dis','client_price_dis','recomended_price_dis','get_albums','cost_price','client_price','recomended_price','date_created', 'date_modified' ,'show_sizes_popup',)
    list_editable = ('cost_price','client_price','recomended_price',)
    list_display_links = ('title',)
    actions = ['download_images_csv','download_images_exel_slim','download_images_exel_warehouse', 'turn_sizes_popup_active', 'turn_sizes_popup_inactive', 'upload_images_to_cloudinary_bool_active', 'upload_images_to_cloudinary_bool_inactive', 'turn_can_tag_active', 'turn_can_tag_inactive', 'turn_out_of_stock_inactive', 'turn_out_of_stock_active']
    inlines = (albumsInline, tableInline, ppnInline)#
    readonly_fields = ('id', 'render_thumbnail', 'render_image',)
    search_fields = ('title','description', 'barcode', 'detailTabel__providerMakat')
    list_filter = ('albums', 'providers','sizes','colors',)
    filter_horizontal = ('colors', 'sizes','providers', 'varients')#'detailTabel'
    list_per_page = 50
    exclude = ('detailTabel',)
    advanced_filter_fields = (
        'title', 'description','sizes__size', 'colors__name','provides__name',
        'barcode', 'cost_price', 'client_price', 'recomended_price', 'albums__title', 'show_sizes_popup',
        ('packingTypeProvider__name', 'שיטת אריזה מהספק'), ('packingTypeClient__name', 'שיטת אריזה ללקוח'),'date_modified', 'can_tag',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('albums', 'detailTabel')
    def turn_out_of_stock_active(modeladmin, request, queryset):
        queryset.update(out_of_stock=True)
    turn_out_of_stock_active.short_description = _('turn out of stock active')
    
    def turn_out_of_stock_inactive(modeladmin, request, queryset):
        queryset.update(out_of_stock=False)
    
    def turn_can_tag_active(modeladmin, request, queryset):
        queryset.update(can_tag=True)
    turn_can_tag_active.short_description = _('turn can tag active')
    
    def turn_can_tag_inactive(modeladmin, request, queryset):
        queryset.update(can_tag=False)
    turn_can_tag_inactive.short_description = _('turn can tag inactive')
    
    
    def turn_sizes_popup_active(modeladmin, request, queryset):
        queryset.update(show_sizes_popup=True)
    turn_sizes_popup_active.short_description = _('turn sizes popup active')

    def turn_sizes_popup_inactive(modeladmin, request, queryset):
        queryset.update(show_sizes_popup=False)
    turn_sizes_popup_inactive.short_description = _('turn sizes popup inactive')
    
    def upload_images_to_cloudinary_bool_active(modeladmin, request, queryset):
        queryset.update(update_image_to_cloudinary=True)
    upload_images_to_cloudinary_bool_active.short_description = _('upload images to cloudinary active')
    
    
    def upload_images_to_cloudinary_bool_inactive(modeladmin, request, queryset):
        queryset.update(update_image_to_cloudinary=False)
    upload_images_to_cloudinary_bool_inactive.short_description = _('upload images to cloudinary inactive')
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
    
    def download_images_exel_warehouse(modeladmin, request, queryset):
        
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
        
        ws.write(0,0,'קטגוריה',title_style)
        ws.write(0,1,'שם מוצר',title_style)
        ws.write(0,2,'מחיר עלות ללא מע"מ',title_style)
        ws.write(0,3,'מחיר חנות ללא מע"מ',title_style)
        ws.write(0,4,'ברקוד',title_style)
        ws.write(0,5,'האם יש ברקוד פיזי (כן/לא)',title_style)
        ws.write(0,6,'האם ניתן למיתוג (כן/לא)',title_style)
        ws.write(0,7,'ספק-1',title_style)
        ws.write(0,8,'מקט אצל הספק-1',title_style)
        ws.write(0,9,'ספק-2',title_style)
        ws.write(0,10,'מקט אצל הספק-2',title_style)
        ws.write(0,11,'ספק-3',title_style)
        ws.write(0,12,'מקט אצל הספק-3',title_style)
        i = 1
        for product in queryset:
            if product.albums.all().count() > 0:
                ws.write(i,0,product.albums.first().title,value_style)
            ws.write(i,1,product.title,value_style)
            ws.write(i,2,product.cost_price,value_style)
            ws.write(i,3,product.client_price,value_style)
            ws.write(i,4,product.barcode,value_style)
            ws.write(i,5, 'כן' if product.has_physical_barcode == True else 'לא', value_style)
            ws.write(i,6, 'כן' if product.can_tag == True else 'לא', value_style)
            ppns = PPN.objects.filter(product=product)
            ppn_offset = 7
            for ppn in ppns:
                ws.write(i,ppn_offset, ppn.provider.name, value_style)
                ws.write(i,ppn_offset+1, ppn.providerProductName, value_style)
                ppn_offset += 2
            
            i+=1
        
        
        ws = wb.add_sheet('sheet2',cell_overwrite_ok=True)
        ws.cols_right_to_left = True
        title_style = XFStyle()
        value_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        instractions = 'ניתן להעלות את הטופס בקישור הבא:'
        url = settings.MY_DOMAIN + reverse('catalog_catalogimage_upload_warehouse_excel')
        ws.write(0,0,instractions,title_style)
        ws.write(1,0,url,value_style)
        
        
        wb.save(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=file_name + '.xls')
        
    def download_images_exel_slim(modeladmin, request, queryset):
        # export title, description, const_price, first provider_name, barcode, first category,
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
        ws.write(0,0,'כותרת',title_style)
        ws.write(0,1,'תיאור',title_style)
        ws.write(0,2,'מחיר עלות ללא מע"מ',title_style)
        ws.write(0,3,'ספקים',title_style)
        ws.write(0,4,'ברקוד',title_style)
        ws.write(0,5,'קטגוריות',title_style)
        i= 1
        queryset = queryset.prefetch_related('albums', 'providers')
        for value in queryset:
            vals = [value.title, value.description, value.cost_price, value.providers.all(), value.barcode, value.albums.all()]
            ws.write(i,0,vals[0],value_style)
            ws.write(i,1,vals[1],value_style)
            ws.write(i,2,vals[2],value_style)
            ws.write(i,3,','.join([provider.name for provider in vals[3]]),value_style)
            ws.write(i,4,vals[4],value_style)
            ws.write(i,5,','.join([album.title for album in vals[5]]),value_style)
            i+=1
            pass
        # write upload instructions to sheet2
        ws = wb.add_sheet('sheet2',cell_overwrite_ok=True)
        ws.cols_right_to_left = True
        title_style = XFStyle()
        value_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        instractions = 'ניתן להעלות את הטופס בקישור הבא:'
        url = settings.MY_DOMAIN + reverse('catalog_catalogimage_upload_slim_excel')
        ws.write(0,0,instractions,title_style)
        ws.write(1,0,url,value_style)

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
    get_albums.short_description = _('categories')
    def url_to_edit_object(obj):
        url = reverse('admin:%s_%s_change' % (obj._meta.app_label,  obj._meta.model_name),  args=[obj.id] )
        return u'<a href="%s">%s</a>' % (url,  obj.__str__())
admin.site.register(CatalogImage,CatalogImageAdmin)

