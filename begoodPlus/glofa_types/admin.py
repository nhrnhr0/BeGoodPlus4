from django.contrib import admin
from glofa_types.models import GlofaType
# Register your models here.
class GlofaTypeAdmin(admin.ModelAdmin):
    list_display = ('num','description',)
    autocomplete_fields = ('supportedProducts',)
admin.site.register(GlofaType,GlofaTypeAdmin)


from glofa_types.models import GlofaImage
class GlofaImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image', )
    filter_horizontal = ('glofaLocation',)
admin.site.register(GlofaImage, GlofaImageAdmin)

from glofa_types.models import GlofaImageTypeConnection
class GlofaImageTypeConnectionAdmin(admin.ModelAdmin):
    list_display = ('glofaImage', 'glofaType', 'cords', 'shape',) 
admin.site.register(GlofaImageTypeConnection,GlofaImageTypeConnectionAdmin)