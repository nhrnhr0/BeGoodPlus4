from django.contrib import admin
from .models import productSizeGroup

# Register your models here.
class productSizeGroupAdmin(admin.ModelAdmin):
    list_display = ('id','name',)
    readonly_fields = ('id',)
    
    search_fields = ('name',)
    ordering = ('name',)
    
    pass
admin.site.register(productSizeGroup, productSizeGroupAdmin)