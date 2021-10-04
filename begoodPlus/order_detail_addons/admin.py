from django.contrib import admin
from order_detail_addons.models import OrderDetailAddons
# Register your models here.
class OrderDetailAddonsAdmin(admin.ModelAdmin):
    list_display = ('order', 'is_print','glofa',)


admin.site.register(OrderDetailAddons,OrderDetailAddonsAdmin)