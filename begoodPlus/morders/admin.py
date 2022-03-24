from django.contrib import admin
from .models import MOrderItem, MOrder
# Register your models here.
class MOrderItemAdmin(admin.ModelAdmin):
    model = MOrderItem
    list_display = ('product','price','provider','ergent','prining','embroidery','comment',)
admin.site.register(MOrderItem, MOrderItemAdmin)


class MOrderAdmin(admin.ModelAdmin):
    model = MOrder
    fields = ('cart', 'client', 'name', 'phone', 'email', 'status', 'message', 'products_display',)
    readonly_fields = ('created', 'updated', 'products_display','get_edit_url')
    list_display = ('id', 'client', 'status', 'created', 'updated','get_edit_url')
    #filter_horizontal = ('products',)
admin.site.register(MOrder, MOrderAdmin)
