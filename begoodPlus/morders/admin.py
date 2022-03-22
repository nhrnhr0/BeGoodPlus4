from django.contrib import admin
from .models import MOrderItem, MOrder
# Register your models here.
class MOrderItemAdmin(admin.ModelAdmin):
    model = MOrderItem
    list_display = ('product','quantity','price','color','size','varient','provider','clientProvider','clientBuyPrice','ergent','prining','embroidery','comment',)
admin.site.register(MOrderItem, MOrderItemAdmin)


class MOrderAdmin(admin.ModelAdmin):
    model = MOrder
    fields = ('cart', 'client', 'name', 'phone', 'email', 'status', 'message', 'products_display',)
    readonly_fields = ('created', 'updated', 'products_display')
    list_display = ('id', 'client', 'status', 'created', 'updated')
    #filter_horizontal = ('products',)
admin.site.register(MOrder, MOrderAdmin)
