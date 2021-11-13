from django.contrib import admin

# Register your models here.
from .models import Client, ClientOrganizations, PaymentTime, PaymantWay, ClientType, UserLogEntry

class ClientAdmin(admin.ModelAdmin):
    list_display = ('user', 'businessName', 'extraName')
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

class UserSessionLoggerAdmin(admin.ModelAdmin):
    list_display = ('user', 'device', 'uniqe_color','is_active','session_start_timestemp','session_end_timestemp',)
admin.site.register(UserSessionLogger, UserSessionLoggerAdmin)

class UserLogEntryAdmin(admin.ModelAdmin):
    
    list_display=('action','timestamp','extra',)
    pass
admin.site.register(UserLogEntry, UserLogEntryAdmin)