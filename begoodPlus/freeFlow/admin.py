from django.contrib import admin
from .models import FreeFlowClient
# Register your models here.
class freeFlowClientAdmin(admin.ModelAdmin):
    list_display = ('create_date', 'name', 'email','phone', 'country','message','privatePerson')
    
admin.site.register(FreeFlowClient,freeFlowClientAdmin)

from .models import FreeFlowContent
from tof.admin import TofAdmin
class FreeFlowContentAdmin(TofAdmin):
    list_display = ('heroH3', 'heroH1', 'heroH2', 'heroBtn', 'aboutTitle',)
admin.site.register(FreeFlowContent,FreeFlowContentAdmin)



from .models import FreeFlowStores
class FreeFlowStoresAdmin(admin.ModelAdmin):
    list_display= ('name', 'url', 'img', 'lat', 'lng')
admin.site.register(FreeFlowStores, FreeFlowStoresAdmin)