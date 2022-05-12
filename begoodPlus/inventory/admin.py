from django.contrib import admin
from django.utils.html import mark_safe

from django.conf import settings
# Register your models here.
from .models import PPN, SKUM, DocStockEnter, ProductEnterItems, ProductEnterItemsEntries, Warehouse, WarehouseStock

class PPNAdmin(admin.ModelAdmin):
    list_display = ('product', 'provider', 'providerProductName', 'created_at')
    search_fields = ('product__title', 'providerProductName', 'provider')
    readonly_fields = ('created_at',)
    list_filter = ('created_at',)
    autocomplete_fields = ['product', 'provider'] 
admin.site.register(PPN, PPNAdmin)


class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'updated_at', 'warehouse_display', 'avgPrice')
    readonly_fields = ('created_at', 'updated_at', 'warehouse_display')
    list_filter = ('warehouse',)
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
    list_display = ('product_display','ppn','total_quantity','price', 'created_at', 'related_doc', )
    readonly_fields = ('product_display','created_at','related_doc', )
    readonly_fields = ('created_at',)
    filter_horizontal = ('entries',)
    def product_display(self, obj):
        
        return mark_safe(('<div><img src="{}" width="100" height="100" />{}</div>').format(settings.CLOUDINARY_BASE_URL + obj.ppn.product.cimage,obj.ppn.product.title))#obj.ppn.product.title
    def related_doc(adminClass, item):
        print(adminClass, item)
        # if item.doc.first() != None:
        #     return item.doc.first().get_admin_edit_url()
        # else:
        return item.doc.first()
admin.site.register(ProductEnterItems, ProductEnterItemsAdmin)


class ProductEnterItemsEntriesAdmin(admin.ModelAdmin):
    list_display = ('size','color','verient','quantity','created_at',)
    readonly_fields = ('created_at',)
    
admin.site.register(ProductEnterItemsEntries, ProductEnterItemsEntriesAdmin)