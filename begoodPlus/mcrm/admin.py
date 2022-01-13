from django.contrib import admin

from mcrm.models import CrmUser

# Register your models here.
'''
class CrmUser(models.Model):
    businessName = models.CharField(max_length=100)
    businessType = models.CharField(max_length=100)
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    want_emails = models.BooleanField(default=True)
    want_whatsapp = models.BooleanField(default=True)
'''

class AdminCrmUser(admin.ModelAdmin):
    list_display = ('businessName', 'businessType', 'name', 'phone', 'email', 'want_emails', 'want_whatsapp', 'businessTypeCustom','flashy_contact_id')
    pass
admin.site.register(CrmUser, AdminCrmUser)