from django.contrib import admin

# Register your models here.
from .models import Client, ClientOrganizations, PaymentTime, PaymantWay, ClientType, UserLogEntry

class ClientAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'user', 'businessName', 'extraName')
    filter_horizontal = ('categorys',)
    pass
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
    list_display = ('user', 'device', 'uniqe_color','is_active','session_start_timestemp','session_end_timestemp','session_duration',)
    readonly_fields = ('uid', 'user', 'device', 'uniqe_color','is_active','session_start_timestemp','session_end_timestemp','session_duration','admin_display_logs')
    #filter_horizontal = ('logs',)
    exclude = ('logs',)
    #readonly_fields = ('uniqe_color','admin_display_logs',)
    #inlines = [UserLogEntryInline]
    def get_queryset(self, request):
        return super(UserSessionLoggerAdmin, self).get_queryset(request).select_related(
            'user').prefetch_related('logs')
admin.site.register(UserSessionLogger, UserSessionLoggerAdmin)

class UserLogEntryAdmin(admin.ModelAdmin):
    
    list_display=('action','timestamp','extra',)
    pass
admin.site.register(UserLogEntry, UserLogEntryAdmin)