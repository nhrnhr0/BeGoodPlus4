from django.contrib import admin
from .models import MOrderItem, MOrder, MOrderItemEntry

class MOrderItemEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'color', 'size', 'varient', 'quantity')
    list_filter = ('product', 'color', 'size', 'varient')
    search_fields = ('product', 'color', 'size', 'varient')
admin.site.register(MOrderItemEntry, MOrderItemEntryAdmin)

# Register your models here.
class MOrderItemAdmin(admin.ModelAdmin):
    model = MOrderItem
    list_display = ('id', 'product','price','ergent','prining','embroidery','comment',)
    filter_horizontal = ('providers','entries','morder')
admin.site.register(MOrderItem, MOrderItemAdmin)


class MOrderAdmin(admin.ModelAdmin):
    model = MOrder
    fields = ('cart', 'client', 'name', 'phone', 'email', 'status', 'message', 'products_display',)
    readonly_fields = ('created', 'updated', 'products_display','get_edit_url')
    list_display = ('id', 'client', 'status', 'created', 'updated','get_edit_url')
    #filter_horizontal = ('products',)
admin.site.register(MOrder, MOrderAdmin)
