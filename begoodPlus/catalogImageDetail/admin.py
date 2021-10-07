from color.models import Color
from django.contrib import admin
from django import forms
from django.utils.translation import gettext_lazy  as _

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
    list_display = ('id', 'provider', 'cost_price', 'client_price', 'recomended_price', 'first_parent', 'providerMakat')
    list_editable = ('provider', 'cost_price', 'client_price', 'recomended_price', 'providerMakat')
    def first_parent(self, instance):
        return instance.parent.first()
    first_parent.short_description = _('product')
    filter_horizontal = ('colors', 'sizes')
    form = CatalogImageDetailAdminForm
    
admin.site.register(CatalogImageDetail, CatalogImageDetailAdmin)