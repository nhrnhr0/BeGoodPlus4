from django.contrib import admin
from .models import Stores, Inventory, InventoryEntry
# Register your models here.
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin.site.register(Stores, StoreAdmin)

class InventoryAdmin(admin.ModelAdmin):
    list_display = ('date', 'owner')
admin.site.register(Inventory, InventoryAdmin)

class InventoryEntryAdmin(admin.ModelAdmin):
    list_display=('stock', 'amount')
admin.site.register(InventoryEntry, InventoryEntryAdmin)