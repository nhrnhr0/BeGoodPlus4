from django.contrib import admin

from .models import MyLogoCategory, MyLogoProduct
# Register your models here.
class MyLogoCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'img', 'title','url')
    filter_horizontal = ('products',)
    
admin.site.register(MyLogoCategory, MyLogoCategoryAdmin)


class MyLogoProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'img', 'title','url','makat', 'description',)
    
admin.site.register(MyLogoProduct, MyLogoProductAdmin)