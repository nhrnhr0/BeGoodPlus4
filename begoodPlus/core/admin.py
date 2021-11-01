from django.contrib import admin

# Register your models here.
from .models import SvelteCartModal, UserSearchData
class UserSearchDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_date', 'term', 'resultCount', 'session')

admin.site.register(UserSearchData, UserSearchDataAdmin)

from .models import BeseContactInformation
class BeseContactInformationAdmin(admin.ModelAdmin):
    list_display = ('id', 'formUUID', 'url', 'created_date', 'name', 'email', 'phone', 'message', 'sumbited', 'owner_display')
admin.site.register(BeseContactInformation,BeseContactInformationAdmin)

from .models import Customer
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('device',)
    filter_horizontal = ('contact',)
admin.site.register(Customer, CustomerAdmin)


from .models import SvelteContactFormModal
class ContactFormModalAdmin(admin.ModelAdmin):
    list_display = ('uniqe_color','device', 'name', 'email', 'phone','message', 'created_date')
admin.site.register(SvelteContactFormModal, ContactFormModalAdmin)

class SvelteCartModalAdmin(admin.ModelAdmin):
    list_display = ('uniqe_color','device','name','phone','email','created_date')
    filter_horizontal = ('products',)
admin.site.register(SvelteCartModal, SvelteCartModalAdmin)
