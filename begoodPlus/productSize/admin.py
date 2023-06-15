from django.contrib import admin

from .models import ProductSize
# Register your models here.


class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ('id', 'size', 'code', 'order')
    list_filter = ('code', )
    search_fields = ('size', 'code', )
    list_editable = ('size', 'code', 'order')


admin.site.register(ProductSize, ProductSizeAdmin)
