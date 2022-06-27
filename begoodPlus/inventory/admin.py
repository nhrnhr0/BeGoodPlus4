from django.contrib import admin
from django.utils.html import mark_safe

from django.conf import settings
# Register your models here.
from .models import PPN, SKUM, DocStockEnter, ProductEnterItems, ProductEnterItemsEntries, ProviderRequestToEnter, Warehouse, WarehouseStock, WarehouseStockHistory

class ProviderRequestToEnterAdmin(admin.ModelAdmin):
    list_display = ('id', 'providerRequest','quantity',)
    list_filter = ('providerRequest',)
    search_fields = ('providerRequest',)
    ordering = ('id',)
    readonly_fields = ('id',)
admin.site.register(ProviderRequestToEnter, ProviderRequestToEnterAdmin)
class PPNAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'barcode','provider', 'providerProductName', 'created_at', 'has_phisical_barcode','providerMakat')
    search_fields = ('product__title', 'providerProductName', 'provider')
    readonly_fields = ('created_at',)
    list_filter = ('created_at',)
    autocomplete_fields = ['product', 'provider'] 
admin.site.register(PPN, PPNAdmin)

class WarehouseStockHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at','old_quantity','new_quantity','created_at','note','user',)
    readonly_fields = ('created_at',)
    list_filter = ('created_at',)
    
admin.site.register(WarehouseStockHistory, WarehouseStockHistoryAdmin)
class WarehouseStockAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'updated_at','warehouse','ppn', 'get_ppn_product','size','color','verient','quantity','avgPrice',) 
    readonly_fields = ('created_at', 'updated_at', 'get_ppn_product')
    #list_filter = ('warehouse',)
    def get_ppn_product(self, obj):
        return obj.ppn.product.title
admin.site.register(WarehouseStock, WarehouseStockAdmin)

class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', )
admin.site.register(Warehouse, WarehouseAdmin)


class DocStockEnterAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'id', 'docNumber', 'provider', 'warehouse', 'isAplied', 'byUser','get_admin_edit_url')
    readonly_fields = ('id', 'created_at','byUser','get_admin_edit_url','admin_products_list')
    #filter_horizontal = ('items',)
    actions = ['apply_doc']
    #list_filter = ('created_at', 'provider', 'warehouse', 'isAplied', 'byUser')
    fields = ('id', 'created_at', 'docNumber', 'provider', 'warehouse', 'isAplied', 'byUser', 'admin_products_list')
    def admin_products_list(self, obj):
        return '<br>'.join([str(item) for item in obj.items.all()])
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
    list_display = ('id', 'product_display','ppn','total_quantity','display_price','created_at', 'related_doc', ) # 
    readonly_fields = ('product_display','created_at','related_doc','display_price' )
    readonly_fields = ('created_at',)
    fields = ('ppn','price','created_at','providerRequests',)
    filter_horizontal = ('providerRequests',)
    def display_price(self, obj):
        return str(obj.price)
    def product_display(self, obj):
        
        return mark_safe(('<div><img src="{}" width="100" height="100" />{}</div>').format(settings.CLOUDINARY_BASE_URL + str(obj.ppn.product.cimage),str(obj.ppn.product.title)))#obj.ppn.product.title
    def related_doc(adminClass, item):
        print(adminClass, item)
        # if item.doc.first() != None:
        #     return item.doc.first().get_admin_edit_url()
        # else:
        return item.doc.first()
admin.site.register(ProductEnterItems, ProductEnterItemsAdmin)


class ProductEnterItemsEntriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'size','color','verient','quantity','created_at',)
    readonly_fields = ('created_at',)
    
admin.site.register(ProductEnterItemsEntries, ProductEnterItemsEntriesAdmin)