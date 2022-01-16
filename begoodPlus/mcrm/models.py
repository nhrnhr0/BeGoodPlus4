from django.db import models
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class CrmUser(models.Model):
    businessName = models.CharField(max_length=100, verbose_name=_('business name'))
    businessType = models.CharField(max_length=100, verbose_name=_('business type'))
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('business type custom'))
    name = models.CharField(max_length=100, verbose_name=_('name'))
    phone = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('phone'))
    email = models.EmailField(max_length=100, null=True, blank=True, verbose_name=_('email'))
    want_emails = models.BooleanField(default=True, verbose_name=_('want emails'))
    want_whatsapp = models.BooleanField(default=True, verbose_name=_('want whatsapp'))
    flashy_contact_id = models.CharField(max_length=256, null=True, blank=True, verbose_name=_('flashy contact id'))
    
    class Meta():
        unique_together = ('businessName', 'name')