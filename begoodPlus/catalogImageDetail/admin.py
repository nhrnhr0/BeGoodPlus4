from color.models import Color
from django.contrib import admin
from django import forms

from .models import CatalogImageDetail
# Register your models here.
class CatalogImageDetailAdminForm(forms.ModelForm):
    class Meta:
        model = CatalogImageDetail
        fields = '__all__'
    def __init__(self, *args, **kwargs):
        super(CatalogImageDetailAdminForm, self).__init__(*args, **kwargs)
        print(self)
class CatalogImageDetailAdmin(admin.ModelAdmin):
    list_display = ('provider', 'cost_price', 'client_price', 'recomended_price', )
    filter_horizontal = ('colors', 'sizes')
    form = CatalogImageDetailAdminForm
    
admin.site.register(CatalogImageDetail, CatalogImageDetailAdmin)