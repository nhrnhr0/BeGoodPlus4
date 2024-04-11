# from django.contrib import admin

# from .models import Stock
# from admin_numeric_filter.admin import NumericFilterModelAdmin, RangeNumericFilter
# from admin_adv_search_builder.filters import AdvancedSearchBuilder

# Register your models here.
# class StockAdmin(NumericFilterModelAdmin):
#     list_display = ('product','catalog_part', 'provider', 'productSize', 'productColor', 'packingType', 'amount','provider_has_stock','provider_resupply_date','inst_client_range','const_sing_client',)
#     readonly_fields = ('buy_cost_tax',)
#     search_fields = ('product__name', 'provider__name', 'productSize__size', 'productColor__name')
#     list_filter = (('buy_cost', RangeNumericFilter), 
#                     ('const_inst_client_min', RangeNumericFilter),
#                     'provider','product', 'productSize', 'productColor', 'packingType','provider_has_stock','provider_resupply_date')
    

# admin.site.register(Stock, StockAdmin)