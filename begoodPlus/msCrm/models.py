from django.db import models
from django.utils.translation import gettext_lazy  as _


class MsCrmBusinessTypeSelect(models.Model):
    name = models.CharField(max_length=100, unique=True)
    class Meta():
        ordering = ['id',]

    def __str__(self):
        return self.name
class MsCrmIntrest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    class Meta():
        ordering = ['id',]

    def __str__(self):
        return self.name

# Create your models here.
class MsCrmUser(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    businessName = models.CharField(max_length=100, verbose_name=_('business name')) 
    businessSelect = models.ForeignKey(to=MsCrmBusinessTypeSelect, on_delete=models.SET_NULL, verbose_name=_('business'), null=True, blank=True)
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('business type custom'))
    name = models.CharField(max_length=100, verbose_name=_('name'))
    phone = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('phone'))
    email = models.EmailField(max_length=100, null=True, blank=True, verbose_name=_('email'))
    address = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('address'))
    want_emails = models.BooleanField(default=True, verbose_name=_('want emails'))
    want_whatsapp = models.BooleanField(default=True, verbose_name=_('want whatsapp'))
    flashy_contact_id = models.CharField(max_length=256, null=True, blank=True, verbose_name=_('flashy contact id'))
    intrests = models.ManyToManyField(MsCrmIntrest, blank=True, verbose_name=_('intrested'))
    