from django.db import models

# Create your models here.
class CrmUser(models.Model):
    businessName = models.CharField(max_length=100)
    businessType = models.CharField(max_length=100)
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    want_emails = models.BooleanField(default=True)
    want_whatsapp = models.BooleanField(default=True)
    flashy_contact_id = models.CharField(max_length=256, null=True, blank=True)