import requests
from django.contrib import admin
from django.utils.translation import gettext_lazy  as _
import io
from django.http import FileResponse
from openpyxl import Workbook
from openpyxl.worksheet.datavalidation import DataValidation
import client
from openpyxl.drawing import image
from openpyxl.utils.cell import get_column_letter
# Register your models here.
from .models import ActiveCartTracker, SvelteCartModal, UserSearchData
class ActiveCartTrackerAdmin(admin.ModelAdmin):
    list_display = ('last_updated','created_at','last_ip','active_cart_id','cart_products_size')
    readonly_fields = ('last_updated','created_at','last_ip','active_cart_id','cart_products_html_table','cart_products_size')
    
admin.site.register(ActiveCartTracker, ActiveCartTrackerAdmin)

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


def cart_to_dict(obj: SvelteCartModal):
    clients_name = ''
    if obj.user:
        if obj.user.is_anonymous == False:
            clients_name = obj.user.client.businessName
        else:
            clients_name = 'anonymous'
    else:
        clients_name = 'anonymous'
    products = []
    for idx, entry in enumerate(obj.productEntries.all()):
        providers = []
        for catalogImageDetail in entry.product.detailTabel.all():
            makat = ''
            if catalogImageDetail.providerMakat != None and catalogImageDetail.providerMakat != '': 
                    makat = catalogImageDetail.providerMakat
            providers.append({
                'name': catalogImageDetail.provider.name,
                'makat': makat
            })
        providers_with_makat = [v['name'] for v in providers]
        all_providers = entry.product.providers.all()
        all_providers = all_providers.exclude(name__in=providers_with_makat)
        for provider in all_providers:
            providers.append({
                'name': provider.name,
                'makat': '-',
            })
        products.append({
            'id': entry.product.id,
            'שם': entry.product.title,
            'כמות': entry.amount,
            'מחיר עלות ללא מע\"מ': entry.product.cost_price,
            'מחיר חנות ללא מע\"מ': entry.product.client_price,
            'מחיר לקוח פרטי ללא מע\"מ': entry.product.recomended_price,
            'ספקים': providers,
        })
    ret = {
        'משתמש': clients_name,
        'מכשיר': obj.device,
        'שם בטופס': obj.name,
        'טלפון בטופס': obj.phone,
        'אימייל בטופס': obj.email,
        'תאריך הגשה': obj.created_date.strftime("%m/%d/%Y, %H:%M:%S"),
        'מוצרים': products,
    }
    return ret

from core.tasks import send_cart_notification
class SvelteCartModalAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'uniqe_color','device','name','phone','email','created_date')
    #filter_horizontal = ('products',)
    exclude = ('products','productEntries')
    readonly_fields =('products_amount_display_with_sizes_and_colors',)
    actions = ['resend_email_action','download_cart_excel',]
    def resend_email_action(modeladmin, request, queryset):
        for obj in queryset:
            send_cart_notification.delay(obj.id)
    resend_email_action.short_description = _("resend selected carts email")
    
    
    
    def data_to_excel(self, data, filename):
        wb = Workbook()
        main_ws = wb.active
        main_ws.sheet_view.rightToLeft = True
        ws_rows_counter = 1
        main_ws.append(['שם מוצר', 'כמות', 'מחיר עלות ללא מע"מ','מחיר חנות ללא מע"מ', 'מחיר לקוח פרטי ללא מע"מ', 'ספקים', 'לקוח','תאריך הזמנה'])
        for cart in data:
            active_ws = wb.create_sheet(cart['משתמש'])
            active_ws.sheet_view.rightToLeft = True
            active_ws.append(['משתמש', 'מכשיר', 'שם בטופס', 'טלפון בטופס', 'אימייל בטופס', 'תאריך הגשה'])
            active_ws.append([cart['משתמש'], cart['מכשיר'], cart['שם בטופס'], cart['טלפון בטופס'], cart['אימייל בטופס'], cart['תאריך הגשה']])
            active_ws.append(['מוצרים'])
            active_ws.append(['שם', 'כמות', 'מחיר עלות ללא מע"מ','מחיר חנות ללא מע"מ', 'מחיר לקוח פרטי ללא מע"מ', 'ספקים'])
            
            row_products_offset = 4
            current_row = row_products_offset
            for product in cart['מוצרים']:
                
                active_ws.append([product['שם'], product['כמות'], product['מחיר עלות ללא מע"מ'], product['מחיר חנות ללא מע"מ'], product['מחיר לקוח פרטי ללא מע"מ']])
                providers = product['ספקים']
                if(len(providers) > 0):
                    providers = [(v['name'] + ' - ' + v['makat']).replace(',','').replace('\"', '') for v in providers]
                    print(providers)
                    providers_str = ','.join(providers)
                    dv = DataValidation(type="list", formula1='"' + providers_str + '"', allow_blank=False)
                    active_ws.add_data_validation(dv)
                    current_row += 1
                    wanted_col = 6
                    provider_cell = active_ws.cell(row=current_row, column=wanted_col)
                    provider_cell.value = providers[0]
                    dv.add(provider_cell)
                    
                    ws_rows_counter += 1
                    main_ws.append([product['שם'], product['כמות'], product['מחיר עלות ללא מע"מ'], product['מחיר חנות ללא מע"מ'], product['מחיר לקוח פרטי ללא מע"מ']])
                    main_ws.add_data_validation(dv)
                    provider_cell = main_ws.cell(row=ws_rows_counter, column=wanted_col)
                    provider_cell.value = providers[0]
                    dv.add(provider_cell)
                    main_ws.cell(row=ws_rows_counter, column=7).value = cart['משתמש']
                    main_ws.cell(row=ws_rows_counter, column=8).value = cart['תאריך הגשה']
        return wb
    def download_cart_excel(modeladmin, request, queryset):
        queryset = queryset.select_related('user').prefetch_related('productEntries', 'productEntries__product__providers')
        
        file_name='cart_excel'
        buffer = io.BytesIO()
        all_data = []
        for obj in queryset:
            file_name += '_' + str(obj.id)
            cart_data = cart_to_dict(obj)
            all_data.append(cart_data)
            print(cart_data)
        wb = modeladmin.data_to_excel(all_data, file_name)
        wb.save(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=file_name + '.xls')
        return
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
        all_ws = wb.add_sheet('all')
        all_ws.cols_right_to_left = True
        all_rows = []
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
            timestemp = obj.created_date.strftime("%m/%d/%Y, %H:%M:%S")
            ws.write(1, 0, clients_name,value_style)
            ws.write(1, 1, obj.device,value_style)
            ws.write(1, 2, obj.name,value_style)
            ws.write(1, 3, obj.phone,value_style)
            ws.write(1, 4, obj.email,value_style)
            ws.write(1, 5, obj.created_date.strftime("%m/%d/%Y, %H:%M:%S"),value_style)
            
            ws.write(4, 0, "שם משתמש",title_style)
            ws.write(4, 1, "תאריך הגשה",title_style)
            ws.write(4, 2, "id",title_style)
            ws.write(4, 3, "שם",title_style)
            ws.write(4, 4, "כמות",title_style)
            ws.write(4, 5, "מחיר עלות ללא מע\"מ",title_style)
            ws.write(4, 6, 'מחיר חנות ללא מע"מ',title_style)
            ws.write(4, 7, 'מחיר לקוח פרטי ללא מע\"מ',title_style)
            
            ws.write(4, 8, "ספקים",title_style)
            products_table_offset = 5
            for idx, entry in enumerate(obj.productEntries.all()):
                row = []
                ws.write(products_table_offset + idx, 0, clients_name,value_style)
                ws.write(products_table_offset + idx, 1, timestemp,value_style)
                ws.write(products_table_offset + idx, 2, entry.product.id,value_style)
                ws.write(products_table_offset + idx, 3, entry.product.title,value_style)
                ws.write(products_table_offset + idx, 4, entry.amount, value_style)
                ws.write(products_table_offset + idx, 5, entry.product.cost_price, value_style)
                ws.write(products_table_offset + idx, 6, entry.product.client_price, value_style)
                ws.write(products_table_offset + idx, 7, entry.product.recomended_price, value_style)
                
                row.append(clients_name)
                row.append(timestemp)
                row.append(entry.product.id)
                row.append(entry.product.title)
                row.append(entry.amount)
                row.append(entry.product.cost_price)
                row.append(entry.product.client_price)
                row.append(entry.product.recomended_price)
                
                provider_offset = 8
                providers_with_makat = []
                for catalogImageDetail in entry.product.detailTabel.all():
                    provider_name = catalogImageDetail.provider.name
                    provider_makat = catalogImageDetail.providerMakat
                    providers_with_makat.append(provider_name)
                    ws.write(products_table_offset + idx, provider_offset, provider_name,value_style)
                    provider_offset += 1
                    ws.write(products_table_offset + idx, provider_offset, provider_makat,value_style)
                    provider_offset += 1
                    
                    row.append(provider_name)
                    row.append(provider_makat)
                all_providers = entry.product.providers.all()
                # filter out the providers that are in the catalogImageDetail
                all_providers = all_providers.exclude(name__in=providers_with_makat)
                for provider in all_providers:
                    ws.write(products_table_offset + idx, provider_offset, provider.name,value_style)
                    provider_offset += 1
                    ws.write(products_table_offset + idx, provider_offset, '-',value_style)
                    provider_offset += 1
                    row.append(provider.name)
                    row.append('-')
                all_rows.append(row)
                pass
            pass # end of cart
        for idx, row in enumerate(all_rows):
            for col_idx, cell in enumerate(row):
                all_ws.write(idx+1, col_idx, cell)
        wb.save(buffer)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=file_name + '.xls')
    download_cart_excel.short_description = _("download selected carts excel")
admin.site.register(SvelteCartModal, SvelteCartModalAdmin)
