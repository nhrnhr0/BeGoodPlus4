from django.contrib import admin

# Register your models here.

from .models import CustomerCart
class CustomerCartAdmin(admin.ModelAdmin):
    list_display = ('id', 'formUUID', 'created_date', 'name', 'email', 'phone', 'sumbited')
    filter_horizontal = ('products',)
admin.site.register(CustomerCart, CustomerCartAdmin)