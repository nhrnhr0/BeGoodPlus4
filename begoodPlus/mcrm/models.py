from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.utils.html import mark_safe
class CrmTag(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('name'), unique=True)
    def __str__(self):
        return self.name
# Create your models here.
class CrmUser(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    businessName = models.CharField(max_length=100, verbose_name=_('business name'))
    businessType = models.CharField(max_length=100, verbose_name=_('business type'))
    businessTypeCustom = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('business type custom'))
    name = models.CharField(max_length=100, verbose_name=_('name'))
    phone = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('phone'))
    email = models.EmailField(max_length=100, null=True, blank=True, verbose_name=_('email'))
    address = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('address'))
    want_emails = models.BooleanField(default=True, verbose_name=_('want emails'))
    want_whatsapp = models.BooleanField(default=True, verbose_name=_('want whatsapp'))
    flashy_contact_id = models.CharField(max_length=256, null=True, blank=True, verbose_name=_('flashy contact id'))
    tags = models.ManyToManyField('CrmTag', blank=True, verbose_name=_('tags'))
    
    class Meta():
        unique_together = ('businessName', 'name')
        
    def tag_display(self):
        return mark_safe('<br>'.join([tag.name for tag in self.tags.all()]))