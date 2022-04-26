from django.contrib import admin

# Register your models here.
from .models import PPN, SKUM, DocStockEnter, ProductEnterItems, Warehouse, WarehouseStock

class PPNAdmin(admin.ModelAdmin):
    list_display = ('product', 'provider', 'providerProductName', 'created_at')
    search_fields = ('product__title', 'providerProductName')
    readonly_fields = ('created_at',)
    list_filter = ('created_at',)
admin.site.register(PPN, PPNAdmin)


class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'updated_at', 'sku', 'quantity', 'warehouse_display', 'avgPrice')
    readonly_fields = ('created_at', 'updated_at', 'warehouse_display')
    list_filter = ('warehouse', 'sku')
    def warehouse_display(self, obj):
        return obj.warehouse.first().name
admin.site.register(WarehouseStock, WarehouseStockAdmin)

class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', )
admin.site.register(Warehouse, WarehouseAdmin)


class DocStockEnterAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'id', 'docNumber', 'provider', 'warehouse', 'isAplied', 'byUser','get_admin_edit_url')
    readonly_fields = ('created_at','byUser','get_admin_edit_url')
    filter_horizontal = ('items',)
    actions = ['apply_doc']
    list_filter = ('created_at', 'provider', 'warehouse', 'isAplied', 'byUser')
    
    def apply_doc(self, request, queryset):
        for doc in queryset:
            doc.apply_doc()
admin.site.register(DocStockEnter, DocStockEnterAdmin)

class SKUMAdmin(admin.ModelAdmin):
    list_display = ('ppn', 'size', 'color', 'verient', 'created_at')
    readonly_fields = ('created_at',)
    list_filter = ('created_at',)
admin.site.register(SKUM, SKUMAdmin)


class ProductEnterItemsAdmin(admin.ModelAdmin):
    list_display = ('sku', 'quantity','price', 'created_at',)
    readonly_fields = ('created_at',)
admin.site.register(ProductEnterItems, ProductEnterItemsAdmin)