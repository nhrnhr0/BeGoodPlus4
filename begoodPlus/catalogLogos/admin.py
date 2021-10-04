from django.contrib import admin
#from adminsortable2.admin import SortableAdminMixin
from adminsortable.admin import SortableAdmin
from .models import CatalogLogo
# Register your models here.
class CatalogLogoAdmin(SortableAdmin):
    list_display = ('title', 'render_image')
    readonly_fields = ('render_image',)
    

admin.site.register(CatalogLogo,CatalogLogoAdmin)