from django.contrib import admin
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
    actions = ['export_xlsx_for_whatsapp',]
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