from django.contrib import admin

from .models import ProductColor
# Register your models here.

class ProductColorAdmin(admin.ModelAdmin):
    model = ProductColor
    list_display = ('id', 'name', 'color', 'colored_box', 'code',)
    #ordering = ('code',)
    
admin.site.register(ProductColor, ProductColorAdmin)