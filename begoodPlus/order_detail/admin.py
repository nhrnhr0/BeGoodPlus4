from django.contrib import admin
from order_detail.models import OrderDetail
class OrderDetailAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'size', 'color', 'amount', 'add_printing', 'add_embroidery',)


admin.site.register(OrderDetail,OrderDetailAdmin)