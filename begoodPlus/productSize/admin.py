from django.contrib import admin

from .models import ProductSize, ProductSizeGroup
# Register your models here.
class ProductSizeGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name', )
    list_editable = ('name', )
admin.site.register(ProductSizeGroup, ProductSizeGroupAdmin)

class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ('id', 'size', 'order', 'group', 'product_count')
    list_filter = ('group', )
    search_fields = ('size', 'code', 'group__name')
    list_editable = ('size', 'order', 'group')
    
    def product_count(self, obj):
        return obj.catalogimage_set.count()


admin.site.register(ProductSize, ProductSizeAdmin)
