from django.contrib import admin
from .models import Provider
# Register your models here.
'''from product.models import Product
class productInline(admin.TabularInline):
    #fields = ('render_image',)
    model = Provider.through
    fields = ('image', 'render_image',)
    readonly_fields = ('render_image',)
class castumProviderAdmin(admin.ModelAdmin):
    inlines = [productInline,]

admin.site.register(Provider, castumProviderAdmin)'''

'''
class StockInline(admin.TabularInline):
    model = Stock
    fields = ('product', 'provider', 'productSize','productColor', 'packingType', 'amount', 'provider_has_stock',)
    readonly_fields = ('product', 'provider', 'productSize', 'productColor', 'packingType',)
    extra = 1
    show_change_link = True
    
    def get_queryset(self, request):
        return super(StockInline, self).get_queryset(request).select_related('product', 'productSize', 'productColor', 'packingType')
    
    pass
'''    
class ProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'code',]
    search_fields = ['name', 'code',]
    #inlines = [StockInline,]
    pass
admin.site.register(Provider, ProviderAdmin)