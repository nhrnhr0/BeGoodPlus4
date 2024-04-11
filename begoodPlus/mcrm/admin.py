# import csv
# from datetime import datetime
# from django.contrib import admin
# from django.http import HttpResponse
# from django.conf import settings
# from numpy import NaN
# from begoodPlus.secrects import MAPS_API_KEY
# from catalogAlbum.models import CatalogAlbum
# from mcrm.models import CrmBusinessTypeSelect, CrmTag
# from advanced_filters.admin import AdminAdvancedFiltersMixin
# import csv
# from django.http import HttpResponse
# import io
# from mcrm.models import CrmUser, CrmIntrest
# import xlsxwriter
# from adminsortable.admin import SortableAdmin


# # Register your models here.
# '''
# class CrmUser(models.Model):
#     businessName = models.CharField(max_length=100)
#     businessType = models.CharField(max_length=100)
#     businessTypeCustom = models.CharField(max_length=100, null=True, blank=True)
#     name = models.CharField(max_length=100)
#     phone = models.CharField(max_length=100, null=True, blank=True)
#     email = models.EmailField(max_length=100, null=True, blank=True)
#     want_emails = models.BooleanField(default=True)
#     want_whatsapp = models.BooleanField(default=True)
# '''
# class CrmBusinessTypeSelectAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name',)
# admin.site.register(CrmBusinessTypeSelect, CrmBusinessTypeSelectAdmin)

# class AdminCrmTag(admin.ModelAdmin):
#     list_display = ('id', 'name',)
# admin.site.register(CrmTag, AdminCrmTag)

# class AdminCrmIntrest(admin.ModelAdmin):
#     list_display=('id', 'name',)
# admin.site.register(CrmIntrest, AdminCrmIntrest)


# class AdminCrmUser(admin.ModelAdmin,AdminAdvancedFiltersMixin):
#     list_display = ('id', 'businessName', 'name','businessSelect', 'businessType','businessTypeCustom', 'phone', 'email', 'want_emails', 'want_whatsapp','flashy_contact_id', 'created_at', 'updated_at','address', )
#     search_fields = ('businessName', 'name', 'businessType','businessTypeCustom', 'phone', 'email', 'tags__name', 'address', )
#     readonly_fields = ('tag_display','created_at', 'updated_at',)
#     advanced_filter_fields = ('businessName', 'name', 'phone', 'email','businessType', 'businessTypeCustom' 'want_emails', 'want_whatsapp', ('tags__name', 'tag name'), 'address', 'created_at', 'updated_at',)
#     filter_horizontal = ('tags','intrested',)
#     actions = ['export_as_csv', 'export_xlsx_for_whatsapp', 'export_all_to_execl', 'download_full_CRM']

    
    
#     def change_view(self, request, object_id, form_url='', extra_context=None):
#         extra_context = extra_context or {}
#         extra_context['MAPS_API_KEY'] = MAPS_API_KEY
#         return super().change_view(request, object_id, form_url, extra_context=extra_context)
    
#     def download_full_CRM(self, request, queryset):
#         output = io.BytesIO()
#         workbook = xlsxwriter.Workbook(output)
#         worksheet = workbook.add_worksheet()
#         yesNoSheet = workbook.add_worksheet('YesNo')
#         headers = ['שם העסק','שם', 'select','עסק לא מוגדר', 'טלפון', 'אימייל', 'רוצה מיילים', 'רוצה וואצאפ', 'כתובת', 'שם עסק ישן']
        
#         intrested_worksheet = workbook.add_worksheet('תחומי_עניין')
#         all_intrests = CatalogAlbum.objects.filter(is_public=True).values_list('title', flat=True)
#         intrested = []
#         for intrest in all_intrests:
#             intrested.append(intrest)
#             headers.append(intrest)
#         intrested_worksheet.write(0, 0, 'תחומי_עניין')
#         intrested_worksheet.write_column(1, 0, intrested)
        
#         buisness_types_worksheet = workbook.add_worksheet('סוגי_עסק')
#         all_buisness_types = CrmBusinessTypeSelect.objects.all()
#         buisness_types = []
#         for buisness_type in all_buisness_types:
#             buisness_types.append(buisness_type.name)
#         buisness_types_worksheet.write(0, 0, 'סוגי_עסק')
#         buisness_types_worksheet.write_column(1, 0, buisness_types)
        
#         yesNoSheet.write(0, 0, 'YesNo')
#         yesno = ['', 'לא']
#         yesNoSheet.write_column(1, 0, yesno)
        
#         data = []
        
        
#         data.append(headers)
        
#         all_users = CrmUser.objects.all()
#         for user in all_users:
#             #intrests = ','.join(['{},'.format(intrest.name) for intrest in user.intrested.all()])
#             bname = None
#             if user.businessSelect:
#                 bname = user.businessSelect.name
#             entry = [user.businessName, user.name, bname,user.businessTypeCustom, user.phone, user.email, '1' if user.want_emails else '0', '1' if user.want_whatsapp else '0', user.address,user.businessType]
#             user_intrests = user.intrested.all().values_list('name', flat=True)
#             for intrest in intrested:
#                 # intrested = [cat1Txt, cat2Txt, cat3Txt]
#                 # example 1
#                 # user.intrested = [cat3Txt]
#                 # mintrests =  [0,0,1]
#                 # example 2
#                 # user.intrested = [cat1Txt, cat2Txt]
#                 # mintrests =  [1,1,0]
#                 if intrest in user_intrests:
#                     entry.append('')
#                 else:
#                     entry.append('לא')
#             data.append(entry)
#         for row, row_data in enumerate(data):
#             for col, val in enumerate(row_data):
#                 worksheet.write(row, col, val)
        
#         worksheet.data_validation('C1:C{}'.format(len(data)), {'validate': 'list', 'source': 'סוגי_עסק!$A$2:$A${}'.format(len(all_buisness_types) +1)})
        
#         excel_col_num = lambda a: 0 if a == '' else 1 + ord(a[-1]) - ord('A') + 26 * excel_col_num(a[:-1])

#         excel_col_name = lambda n: '' if n <= 0 else excel_col_name((n - 1) // 26) + chr((n - 1) % 26 + ord('A'))
#         # Close the workbook before sending the data.
#         # create a data validation from M:1 to M + len(intrested) X len(data) of yes/no
#         startLetter = excel_col_name(len(headers) - len(intrested)+1)
#         endLetter = excel_col_name(len(headers))
#         cell = '{}2:{}{}'.format(startLetter, endLetter, len(data))
#         worksheet.data_validation(cell, {'validate': 'list', 'source': 'YesNo!$A$2:$A$3'})
        
#         instractions_worksheet = workbook.add_worksheet('הוראות')
#         instractions_worksheet.write(0, 0, 'הוראות')
#         instractions_worksheet.write(1, 0, settings.MY_DOMAIN + '/admin/crm/crmuser/upload_execl2')
        
#         workbook.close()

#         # Rewind the buffer.
#         output.seek(0)
        
#         # Set up the Http response.
#         filename = 'all_crm.xlsx'
#         response = HttpResponse(
#             output,
#             content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#         )
#         response['Content-Disposition'] = 'attachment; filename=%s' % filename
#         return response
#     def export_xlsx_for_whatsapp(self, request, queryset):
#         output = io.BytesIO()
#         workbook = xlsxwriter.Workbook(output)
#         worksheet = workbook.add_worksheet()
        
#         # headers:
#         # WhatsApp Number(with country code)	First Name	Last Name	Other
#         # data example:
#         # +11234567890	John	Doe
#         # data:
#         data = []
#         data.append(['WhatsApp Number(with country code)', 'First Name', 'Last Name', 'Other'])
#         queryset = queryset.filter(want_whatsapp=True)
#         for obj in queryset:
#             if obj.phone.startswith('+'):
#                 data.append([obj.phone, obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
#             elif obj.phone.startswith('\u2066'):
#                 data.append(['+'+obj.phone[1:], obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
#             else:
#                 data.append(['+'+obj.phone, obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name, ''])
#             #data.append(['+' + str(obj.phone), obj.name.split(' ')[0], obj.name.split(' ')[-1], obj.name])
        
#         # Write some test data.
#         for row_num, columns in enumerate(data):
#             for col_num, cell_data in enumerate(columns):
#                 worksheet.write(row_num, col_num, cell_data)

#         # Close the workbook before sending the data.
#         workbook.close()

#         # Rewind the buffer.
#         output.seek(0)
        
#         # Set up the Http response.
#         filename = 'whatsapp_list.xlsx'
#         response = HttpResponse(
#             output,
#             content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#         )
#         response['Content-Disposition'] = 'attachment; filename=%s' % filename

#         return response
#     export_xlsx_for_whatsapp.short_description = "Export as XLSX for Whatsapp"
        
#     def export_as_csv(self, request, queryset):
#         # Create the HttpResponse object with the appropriate CSV header.
#         f = io.StringIO()
#         writer = csv.writer(f)
#         # write: first name, fullname, phone
#         writer.writerow(["FirstName", "FullName", "Phone"])
#         for obj in queryset:
#             writer.writerow([obj.name.split(' ')[0], obj.name, obj.phone])
        
#         f.seek(0)
#         response = HttpResponse(f, content_type='text/csv')
#         # crm_users_(rowcount)_<current_date>.csv
#         file_name = "crm_users_({})_{}.csv".format(queryset.count(), datetime.now().strftime("%Y-%m-%d"))
#         response['Content-Disposition'] = 'attachment; filename={}.csv'.format(file_name)
#         return response
#     export_as_csv.short_description = "Export selected objects as CSV file"
    
#     def export_all_to_execl(self, request, queryset):
#         '''
#         businessName
#         businessType
#         businessTypeCustom
#         name
#         phone
#         email
#         address
#         want_emails
#         want_whatsapp
#         flashy_contact_id
#         tags
#         intrested
#         '''
#         # Sheet 1
#         # businessName, businessType, businessTypeCustom, name, phone, email, want_emails, want_whatsapp, address, tags, intrested
#         # Sheet 2
#         # all the tags in the system (for filtering in Sheet 1)
#         # Sheet 3
#         # all the intrested in the system (for filtering in Sheet 1)
#         output = io.BytesIO()
#         workbook = xlsxwriter.Workbook(output)
#         worksheet = workbook.add_worksheet()
#         tags_worksheet = workbook.add_worksheet('תגים')
#         intrested_worksheet = workbook.add_worksheet('תחומי_עניין')
#         frontend_worksheet = workbook.add_worksheet('צד_לקוח')
#         frontend_options = ['אבטחה','הייטק','הפקות/ חיי לילה','חברות ניקיון וכוח אדם ','חקלאים/ גדש','לולים','מוסכים','מטבחים/ מסעדות','מלונאות','מנהל חינוך','מנהל תרבות','מנהל קורונה','מסגריות/ רתכים','מפעל/ תעשייה ','נגריות','נוי/ גננים','רפתות', 'בית אריזה', 'טכנאי/מתקין','תחזוקה','נאמן בטיחות', 'אחר - פרט למטה', ]


#         all_tags = CrmTag.objects.all()
#         tags = []
#         for tag in all_tags:
#             tags.append(tag.name)
#         tags_worksheet.write(0, 0, 'תגים')
#         tags_worksheet.write_column(1, 0, tags)

        
#         all_intrested = CrmIntrest.objects.all()
#         intrested = []
#         for intrest in all_intrested:
#             intrested.append(intrest.name)
#         intrested_worksheet.write(0, 0, 'תחומי עניין')
#         intrested_worksheet.write_column(1, 0, intrested)


#         frontend_worksheet.write(0, 0, 'צד לקוח')
#         frontend_worksheet.write_column(1, 0, frontend_options)
        
#         all_crm = CrmUser.objects.all()
#         # headers:
#         # businessName, businessType, businessTypeCustom, name, phone, email, want_emails, want_whatsapp, address, tags, intrested
#         # data example:
#         # businessName, businessType, businessTypeCustom, name, phone, email, want_emails, want_whatsapp, address, tags, intrested
#         # data:
#         data = []
#         data.append(['שם עסק', 'סוג עסק', 'סוג עסק חדש', 'שם', 'טלפון', 'אימייל', 'רוצה אימיילים', 'רוצה וואצאפ', 'כתוכת', 'תגים', 'תחומי עניין', 'רשימת תגים', 'רשימת תחומי עניין'])
#         for obj in all_crm:
#             data.append([obj.businessName, obj.businessType, obj.businessTypeCustom, obj.name, obj.phone, obj.email, obj.want_emails, obj.want_whatsapp, obj.address, obj.execl_tag_display(), obj.execl_intrested_display()])
#         for row_num, columns in enumerate(data):
#             for col_num, cell_data in enumerate(columns):
#                 worksheet.write(row_num, col_num, cell_data)
#         worksheet.data_validation('L1:L{}'.format(len(data)), {'validate': 'list', 'source': 'תגים!$A$2:$A${}'.format(len(tags)+1)})
#         worksheet.data_validation('M1:M{}'.format(len(data)), {'validate': 'list', 'source': 'תחומי_עניין!$A$2:$A${}'.format(len(intrested)+1)})
#         worksheet.data_validation('B1:B{}'.format(len(data)), {'validate': 'list', 'source': 'צד_לקוח!$A$2:$A${}'.format(len(frontend_options)+1)})
#         # sheet 4
#         # url to uplaod the file
#         info_worksheet = workbook.add_worksheet('פרטי העלאה')
#         info_worksheet.write(0, 0, 'כתובת העלאה')
#         info_worksheet.write(1, 0, settings.MY_DOMAIN + '/admin/crm/crmuser/upload_execl/')
        
#         # Close the workbook before sending the data.
#         workbook.close()

#         # Rewind the buffer.
#         output.seek(0)
        
#         # Set up the Http response.
#         filename = 'output.xlsx'
#         response = HttpResponse(
#             output,
#             content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
#         )
#         response['Content-Disposition'] = 'attachment; filename=%s' % filename

#         return response
#     export_all_to_execl.short_description = "Export all objects as XLSX file"
# admin.site.register(CrmUser, AdminCrmUser)