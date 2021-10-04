from django.contrib import admin
from order.models import Order
from admin_adv_search_builder.filters import AdvancedSearchBuilder

# Register your models here.
class OrderAdmin(admin.ModelAdmin):
    list_display = ('submit_date', 'client_name', 'private_compeny', 'addres', 'telephone', 'email', 'contact_man', 'cellphone',)

    list_filter   = (AdvancedSearchBuilder,)

admin.site.register(Order,OrderAdmin)