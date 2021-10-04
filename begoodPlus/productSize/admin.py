from django.contrib import admin

from .models import ProductSize
# Register your models here.

class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ('size', 'code',)

admin.site.register(ProductSize, ProductSizeAdmin)