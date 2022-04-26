from django.contrib import admin

from catalogImageAttrs.models import ProductPriceEntry, ProductPrices
from django.utils.translation import gettext_lazy  as _

# Register your models here.

class ProductPricesAdmin(admin.ModelAdmin):
    list_display = ('id', 'last_modified','catalogimage','price_table_display',)
admin.site.register(ProductPrices,ProductPricesAdmin)

class ProductPriceEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'price','amount','__str__')
admin.site.register(ProductPriceEntry,ProductPriceEntryAdmin)