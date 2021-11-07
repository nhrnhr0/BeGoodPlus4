from django.contrib import admin

# Register your models here.
from .models import Client, ClientOrganizations, PaymentTime, PaymantWay, ClientType

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
