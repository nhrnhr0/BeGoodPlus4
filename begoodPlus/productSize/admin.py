from django.contrib import admin

from .models import ProductSize
# Register your models here.


class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ('id', 'size',  'order')
    search_fields = ('size',  )
    list_editable = ('size',  'order')


admin.site.register(ProductSize, ProductSizeAdmin)
