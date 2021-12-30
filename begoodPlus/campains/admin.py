from django.contrib import admin
from adminsortable.admin import SortableAdmin, SortableTabularInline
# Register your models here.
from .models import MonthCampain, CampainProduct, PriceTable, PaymantType
class ProductInline(admin.TabularInline):
    model = MonthCampain.products.through
    filter_horizontal = ('priceTable',)
    extra = 1
    
class MonthCampainAdmin(admin.ModelAdmin):
    #is_shown,name,users,startTime,endTime,products,album
    list_display = ('name', 'is_shown', 'startTime', 'endTime', 'show_users', 'album', 'show_products')
    inlines = [ProductInline]
    filter_horizontal = ('users','products',)
    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['my_data'] = {'object_id':object_id, 'name':'test'}
        return super(MonthCampainAdmin, self).change_view(
            request, object_id, form_url, extra_context=extra_context,
        )
    #autocomplete_fields = ('catalogImage',)
admin.site.register(MonthCampain, MonthCampainAdmin)

class CampainProductAdmin(admin.ModelAdmin):
    #autocomplete_fields = ('catalogImage','priceTable',)
    #search_fields = ('catalogImage__title', 'priceTable__price', 
    #                'priceTable__paymentType__text', 
    #                'priceTable__amountBrakepoint__text',
    #                'priceTable__amountBrakepoint__number',)
    pass
admin.site.register(CampainProduct, CampainProductAdmin)

class PriceTableAdmin(admin.ModelAdmin):
    #search_fields = ('amountBrakepoint__text',)
    #search_fields = ('paymentType__text','amountBrakepoint__text', 'amountBrakepoint__number',)
    pass
admin.site.register(PriceTable, PriceTableAdmin)
