from django.conf import settings
from django.contrib import admin

from catalogAlbum.models import CatalogAlbum
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmUser
from advanced_filters.admin import AdminAdvancedFiltersMixin
from django.http import HttpResponse
import io
import xlsxwriter

# Register your models here.
class MsCrmUserAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('id', 'name', 'businessName','businessSelect','businessTypeCustom', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'businessSelect', 'want_emails', 'want_whatsapp')
    def get_queryset(self, request):
        qs = super(MsCrmUserAdmin, self).get_queryset(request).select_related('businessSelect')
        return qs
    search_fields = ('name', 'businessName', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp')
    #advanced_filter_fields = (('מתי נוצר', 'created_at'), ('מתי עודכן', 'updated_at'), ('בחירת שם עסק', 'businessName__name'), ('שם עסק לא מוגדר', 'businessTypeCustom'), 'name', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp')
    advanced_filter_fields = (( 'created_at','מתי נוצר'), ( 'updated_at','מתי עודכן'), ( 'businessName','שם העסק'), ('businessSelect', 'בחירת סוג עסק מספר'),('businessSelect__name', 'בחירת סוג עסק'),('businessTypeCustom','סוג עסק לא מוגדר',), 'name', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp', ('intrests__title', 'תחומי עניין'))
    ordering = ('-created_at',)
    filter_horizontal = ('intrests',)
    actions = ['export_xlsx_for_whatsapp','download_full_CRM',]
    
    
    def download_full_CRM(self, request, queryset):
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()
        yesNoSheet = workbook.add_worksheet('YesNo')
        headers = ['שם העסק','שם', 'select','עסק לא מוגדר', 'טלפון', 'אימייל', 'רוצה מיילים', 'רוצה וואצאפ', 'כתובת',]
        
        intrested_worksheet = workbook.add_worksheet('תחומי_עניין')
        all_intrests = CatalogAlbum.objects.filter(is_public=True).values_list('title', flat=True)
        intrested = []
        for intrest in all_intrests:
            intrested.append(intrest)
            headers.append(intrest)
        intrested_worksheet.write(0, 0, 'תחומי_עניין')
        intrested_worksheet.write_column(1, 0, intrested)
        
        buisness_types_worksheet = workbook.add_worksheet('סוגי_עסק')
        all_buisness_types = MsCrmBusinessTypeSelect.objects.all()
        buisness_types = []
        for buisness_type in all_buisness_types:
            buisness_types.append(buisness_type.name)
        buisness_types_worksheet.write(0, 0, 'סוגי_עסק')
        buisness_types_worksheet.write_column(1, 0, buisness_types)
        
        yesNoSheet.write(0, 0, 'YesNo')
        yesno = ['', 'לא']
        yesNoSheet.write_column(1, 0, yesno)
        
        data = []
        
        
        data.append(headers)
        
        all_users = MsCrmUser.objects.all()
        for user in all_users:
            #intrests = ','.join(['{},'.format(intrest.name) for intrest in user.intrested.all()])
            bname = None
            if user.businessSelect:
                bname = user.businessSelect.name
            entry = [user.businessName, user.name, bname,user.businessTypeCustom, user.phone, user.email, '1' if user.want_emails else '0', '1' if user.want_whatsapp else '0', user.address,]
            user_intrests = user.intrests.all().values_list('title', flat=True)
            for intrest in intrested:
                # intrested = [cat1Txt, cat2Txt, cat3Txt]
                # example 1
                # user.intrested = [cat3Txt]
                # mintrests =  [0,0,1]
                # example 2
                # user.intrested = [cat1Txt, cat2Txt]
                # mintrests =  [1,1,0]
                if intrest in user_intrests:
                    entry.append('')
                else:
                    entry.append('לא')
            data.append(entry)
        for row, row_data in enumerate(data):
            for col, val in enumerate(row_data):
                worksheet.write(row, col, val)
        
        worksheet.data_validation('C1:C{}'.format(len(data)), {'validate': 'list', 'source': 'סוגי_עסק!$A$2:$A${}'.format(len(all_buisness_types) +1)})
        
        excel_col_num = lambda a: 0 if a == '' else 1 + ord(a[-1]) - ord('A') + 26 * excel_col_num(a[:-1])

        excel_col_name = lambda n: '' if n <= 0 else excel_col_name((n - 1) // 26) + chr((n - 1) % 26 + ord('A'))
        # Close the workbook before sending the data.
        # create a data validation from M:1 to M + len(intrested) X len(data) of yes/no
        startLetter = excel_col_name(len(headers) - len(intrested)+1)
        endLetter = excel_col_name(len(headers))
        cell = '{}2:{}{}'.format(startLetter, endLetter, len(data))
        worksheet.data_validation(cell, {'validate': 'list', 'source': 'YesNo!$A$2:$A$3'})
        
        instractions_worksheet = workbook.add_worksheet('הוראות')
        instractions_worksheet.write(0, 0, 'הוראות')
        instractions_worksheet.write(1, 0, settings.MY_DOMAIN + '/admin/crm/crmuser/upload_execl2')
        
        workbook.close()

        # Rewind the buffer.
        output.seek(0)
        
        # Set up the Http response.
        filename = 'all_crm.xlsx'
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=%s' % filename
        return response
    
    
    
    def export_xlsx_for_whatsapp(self, request, queryset):
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()
        
        # headers:
        # WhatsApp Number(with country code)	First Name	Last Name	Other
        # data example:
        # +11234567890	John	Doe
        # data:
        data = []
        data.append(['WhatsApp Number(with country code)', 'First Name', 'Last Name', 'Other'])
        queryset = queryset.filter(want_whatsapp=True)
        for obj in queryset:
            phone = obj.get_clean_phonenumber()
            data.append([phone, obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
            #elif obj.phone.startswith('\u2066'):
            #    data.append(['+'+obj.phone[1:], obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
            #else:
            #    data.append(['+'+obj.phone, obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
            #data.append(['+' + str(obj.phone), obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name])
        
        # Write some test data.
        for row_num, columns in enumerate(data):
            for col_num, cell_data in enumerate(columns):
                worksheet.write(row_num, col_num, cell_data)

        # Close the workbook before sending the data.
        workbook.close()

        # Rewind the buffer.
        output.seek(0)
        
        # Set up the Http response.
        filename = 'whatsapp_list.xlsx'
        response = HttpResponse(
            output,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=%s' % filename

        return response
    export_xlsx_for_whatsapp.short_description = "Export as XLSX for Whatsapp"
admin.site.register(MsCrmUser, MsCrmUserAdmin)

class MsCrmBusinessTypeSelectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)
    list_filter = ('name',)
    search_fields = ('name',)
    ordering = ('-name',)
admin.site.register(MsCrmBusinessTypeSelect, MsCrmBusinessTypeSelectAdmin)

class MsCrmIntrestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)
    list_filter = ('name',)
    search_fields = ('name',)
    ordering = ('-name',)
admin.site.register(MsCrmIntrest, MsCrmIntrestAdmin)