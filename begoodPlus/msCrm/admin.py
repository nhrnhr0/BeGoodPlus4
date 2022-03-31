from django.contrib import admin
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmUser
# Register your models here.
class MsCrmUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'businessName','businessSelect','businessTypeCustom', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'businessName', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp')
    ordering = ('-created_at',)
    filter_horizontal = ('intrests',)
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