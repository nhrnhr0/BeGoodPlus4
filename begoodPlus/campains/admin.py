from django.contrib import admin

# Register your models here.
from .models import MonthCampain, CampainProduct, PriceTable, AmountBrakepoint, PaymantType

class MonthCampainAdmin(admin.ModelAdmin):
    filter_horizontal = ('users','products',)
    autocomplete_fields = ('products',)
admin.site.register(MonthCampain, MonthCampainAdmin)

class CampainProductAdmin(admin.ModelAdmin):
    autocomplete_fields = ('product','priceTable',)
    search_fields = ('product__title', 'priceTable__price', 
                    'priceTable__paymentType__text', 
                    'priceTable__amountBrakepoint__text',
                    'priceTable__amountBrakepoint__number',)
    pass
admin.site.register(CampainProduct, CampainProductAdmin)

class PriceTableAdmin(admin.ModelAdmin):
    #search_fields = ('amountBrakepoint__text',)
    search_fields = ('paymentType__text','amountBrakepoint__text', 'amountBrakepoint__number',)
    pass
admin.site.register(PriceTable, PriceTableAdmin)

class AmountBrakepointAdmin(admin.ModelAdmin):
    #autocomplete_fields = ('PriceTable',)
    pass
admin.site.register(AmountBrakepoint, AmountBrakepointAdmin)

class PaymantTypeAdmin(admin.ModelAdmin):
    pass
admin.site.register(PaymantType, PaymantTypeAdmin)