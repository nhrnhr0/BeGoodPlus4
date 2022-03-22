import csv
from datetime import datetime
from django.contrib import admin
from django.http import HttpResponse
from mcrm.models import CrmTag
from advanced_filters.admin import AdminAdvancedFiltersMixin
import csv
from django.http import HttpResponse
import io
from mcrm.models import CrmUser
import xlsxwriter


# Register your models here.
'''
class CrmUser(models.Model):
    businessName = models.CharField(max_length=100)
    businessType = models.CharField(max_length=100)
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    want_emails = models.BooleanField(default=True)
    want_whatsapp = models.BooleanField(default=True)
'''
class AdminCrmTag(admin.ModelAdmin):
    list_display = ('name',)
    
admin.site.register(CrmTag, AdminCrmTag)

class AdminCrmUser(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('businessName', 'name', 'businessType','businessTypeCustom', 'phone', 'email', 'want_emails', 'want_whatsapp','flashy_contact_id', 'created_at', 'updated_at',)
    search_fields = ('businessName', 'name', 'businessType','businessTypeCustom', 'phone', 'email', 'tags__name')
    readonly_fields = ('tag_display','created_at', 'updated_at',)
    advanced_filter_fields = ('businessName', 'name', 'phone', 'email', 'want_emails', 'want_whatsapp', ('tags__name', 'tag name'))
    filter_horizontal = ('tags',)
    actions = ['export_as_csv', 'export_xlsx_for_whatsapp']
    
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
            data.append(['+' + str(obj.phone), obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name])
        
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
        
    def export_as_csv(self, request, queryset):
        # Create the HttpResponse object with the appropriate CSV header.
        f = io.StringIO()
        writer = csv.writer(f)
        # write: first name, fullname, phone
        writer.writerow(["FirstName", "FullName", "Phone"])
        for obj in queryset:
            writer.writerow([obj.name.split(' ')[0], obj.name, obj.phone])
        
        f.seek(0)
        response = HttpResponse(f, content_type='text/csv')
        # crm_users_(rowcount)_<current_date>.csv
        file_name = "crm_users_({})_{}.csv".format(queryset.count(), datetime.now().strftime("%Y-%m-%d"))
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(file_name)
        return response
    export_as_csv.short_description = "Export selected objects as CSV file"
admin.site.register(CrmUser, AdminCrmUser)