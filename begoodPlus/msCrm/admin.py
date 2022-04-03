from django.contrib import admin
from .models import MsCrmBusinessTypeSelect, MsCrmIntrest, MsCrmUser
from advanced_filters.admin import AdminAdvancedFiltersMixin

# Register your models here.
class MsCrmUserAdmin(AdminAdvancedFiltersMixin, admin.ModelAdmin):
    list_display = ('id', 'name', 'businessName','businessSelect','businessTypeCustom', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'businessSelect', 'want_emails', 'want_whatsapp')
    def get_queryset(self, request):
        qs = super(MsCrmUserAdmin, self).get_queryset(request).select_related('businessSelect')
        return qs
    search_fields = ('name', 'businessName', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp')
    #advanced_filter_fields = (('מתי נוצר', 'created_at'), ('מתי עודכן', 'updated_at'), ('בחירת שם עסק', 'businessName__name'), ('שם עסק לא מוגדר', 'businessTypeCustom'), 'name', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp')
    advanced_filter_fields = (( 'created_at','מתי נוצר'), ( 'updated_at','מתי עודכן'), ( 'businessName','שם העסק'), ('businessSelect', 'בחירת שם עסק מספר'),('businessSelect__name', 'בחירת שם עסק'),('businessTypeCustom','שם עסק לא מוגדר',), 'name', 'phone', 'email', 'address', 'want_emails', 'want_whatsapp', ('intrests__title', 'תחומי עניין'))
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