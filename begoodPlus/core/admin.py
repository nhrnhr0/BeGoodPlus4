from django.contrib import admin
from django.utils.translation import gettext_lazy  as _
import io
from django.http import FileResponse
from xlwt.Style import XFStyle

import client

# Register your models here.
from .models import SvelteCartModal, UserSearchData
class UserSearchDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_date', 'term', 'resultCount', 'session')

admin.site.register(UserSearchData, UserSearchDataAdmin)

from .models import BeseContactInformation
class BeseContactInformationAdmin(admin.ModelAdmin):
    list_display = ('id', 'formUUID', 'url', 'created_date', 'name', 'email', 'phone', 'message', 'sumbited', 'owner_display')
admin.site.register(BeseContactInformation,BeseContactInformationAdmin)

from .models import Customer
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('device',)
    filter_horizontal = ('contact',)
admin.site.register(Customer, CustomerAdmin)


from .models import SvelteContactFormModal
class ContactFormModalAdmin(admin.ModelAdmin):
    list_display = ('user', 'uniqe_color','device', 'name', 'email', 'phone','message', 'created_date')
admin.site.register(SvelteContactFormModal, ContactFormModalAdmin)
import xlwt

from core.tasks import send_cart_email
class SvelteCartModalAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'uniqe_color','device','name','phone','email','created_date')
    #filter_horizontal = ('products',)
    exclude = ('products','productEntries')
    readonly_fields =('products_amount_display',)
    actions = ['resend_email_action','download_cart_excel',]
    def resend_email_action(modeladmin, request, queryset):
        for obj in queryset:
            send_cart_email.delay(obj.id)
    resend_email_action.short_description = _("resend selected carts email")
    
    def download_cart_excel(modeladmin, request, queryset):
        queryset = queryset.select_related('user').prefetch_related('productEntries', 'productEntries__product__providers')
        value_style = XFStyle()
        title_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        value_style.alignment = alignment_center
        title_style.alignment = alignment_center
        
        title_style.font.bold = True
        
        buffer = io.BytesIO()
        wb = xlwt.Workbook()
        file_name='cart_excel'

        for obj in queryset:
            file_name += '_' + str(obj.id)
            ws = wb.add_sheet(str(obj.id),cell_overwrite_ok=True)
            ws.cols_right_to_left = True
            ws.write(0, 0, "משתמש",title_style)
            ws.write(0, 1, "מכשיר",title_style)
            ws.write(0, 2, "שם בטופס",title_style)
            ws.write(0, 3, "טלפון בטופס",title_style)
            ws.write(0, 4, "אימייל בטופס",title_style)
            ws.write(0, 5, "תאריך הגשה",title_style)
            clients_name = ''
            if obj.user:
                if obj.user.is_anonymous == False:
                    clients_name = obj.user.client.businessName
                else:
                    clients_name = 'anonymous'
            else:
                clients_name = 'anonymous'
            ws.write(1, 0, clients_name,value_style)
            ws.write(1, 1, obj.device,value_style)
            ws.write(1, 2, obj.name,value_style)
            ws.write(1, 3, obj.phone,value_style)
            ws.write(1, 4, obj.email,value_style)
            ws.write(1, 5, obj.created_date.strftime("%m/%d/%Y, %H:%M:%S"),value_style)
            
            ws.write(4, 0, "id",title_style)
            ws.write(4, 1, "שם",title_style)
            ws.write(4, 2, "כמות",title_style)
            ws.write(4, 3, "ספקים",title_style)
            
            for idx, entry in enumerate(obj.productEntries.all()):
                ws.write(5 + idx, 0, entry.product.id,value_style)
                ws.write(5 + idx, 1, entry.product.title,value_style)
                ws.write(5 + idx, 2, entry.amount, value_style)
                ws.write(5 + idx, 3, '\n\r'.join(list(entry.product.providers.values_list('name', flat=True))),value_style)
                #ws.write(3 + idx, 2, product.providers)
            #user,device,name,phone,email,products,created_date
        wb.save(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=file_name + '.xls')
    download_cart_excel.short_description = _("download selected carts excel")
admin.site.register(SvelteCartModal, SvelteCartModalAdmin)
