import io
from django.contrib import admin
from django.http.response import HttpResponse
from rest_framework.decorators import action
from django.utils.translation import gettext_lazy  as _

# Register your models here.
from .models import Client, ClientOrganizations, PaymentTime, PaymantWay, ClientType, UserLogEntry
import zipfile

class ClientAdmin(admin.ModelAdmin):
    list_display = ('created_at','__str__', 'user', 'businessName', 'extraName')
    actions = ['generate_user_products_from_sessions']
    filter_horizontal = ('categorys',)
    search_fields = ('businessName', 'user__username', 'email','howPay__name','whenPay__name',)
    list_filter = ('storeType', 'clientType',)
    def generate_user_products_from_sessions(self, request, queryset):
        all_file_buffers = []
        for client in queryset:
            exel_file_buffer = client.generate_user_products_from_sessions()
            if (exel_file_buffer == None):
                continue
            all_file_buffers.append({'name': client.businessName, 'data': exel_file_buffer})
        return self.download_zip_file(all_file_buffers)
    pass

    def download_zip_file(self, filesbuffers):
        #buffer = io.BytesIO()
        '''with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip:
            for file in filesbuffers:
                zip.writestr(file.name, file.read())'''
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for d in filesbuffers:
                file_name = d['name'] + '.xls'
                data = d['data']
                zip_file.writestr(file_name , data.getvalue())
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        response['Content-Disposition'] = 'attachment; filename="products.zip"'
        return response
        
        
admin.site.register(Client, ClientAdmin)


class OnlyNameAdmin(admin.ModelAdmin):
    list_display = ('name',)

admin.site.register(ClientType, OnlyNameAdmin)
admin.site.register(PaymantWay, OnlyNameAdmin)
admin.site.register(PaymentTime, OnlyNameAdmin)
admin.site.register(ClientOrganizations, OnlyNameAdmin)

from .models import UserSessionLogger
'''class UserLogEntryInline(admin.TabularInline):
    model = UserSessionLogger.logs.through
    extra = 0'''

class UserSessionLoggerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'device', 'uniqe_color','is_active','session_start_timestemp','session_end_timestemp','session_duration',)
    readonly_fields = ('uid', 'user', 'device', 'uniqe_color','is_active','session_start_timestemp','session_end_timestemp','session_duration','admin_display_logs')
    #filter_horizontal = ('logs',)
    exclude = ('logs',)
    #readonly_fields = ('uniqe_color','admin_display_logs',)
    #inlines = [UserLogEntryInline]
    actions=('send_telegram_action','generate_user_liked_products_action')
    def get_queryset(self, request):
        return super(UserSessionLoggerAdmin, self).get_queryset(request).select_related(
            'user').prefetch_related('logs')
    
    def generate_user_liked_products_action(modeladmin, request, queryset):
        for o in queryset:
            o.generate_user_liked_products()
    generate_user_liked_products_action.short_description = _("Generate user liked products")
    def send_telegram_action(modeladmin, request, queryset):
        for o in queryset:
            o.send_telegram_message()
    send_telegram_action.short_description = _('Send telegram message')
admin.site.register(UserSessionLogger, UserSessionLoggerAdmin)

class UserLogEntryAdmin(admin.ModelAdmin):
    
    list_display=('action','timestamp','extra',)
    pass
admin.site.register(UserLogEntry, UserLogEntryAdmin)