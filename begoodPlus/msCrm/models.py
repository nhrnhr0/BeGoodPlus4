from django.db import models
from django.utils.translation import gettext_lazy  as _

from catalogAlbum.models import CatalogAlbum
from django.utils.html import mark_safe

class MsCrmBusinessTypeSelect(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(default=0)
    class Meta():
        ordering = ['order',]

    def __str__(self):
        return self.name
    
    def __repr__(self) -> str:
        return self.name

class MsCrmIntrest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    class Meta():
        ordering = ['id',]

    def __str__(self):
        return self.name
class MsCrmIntrestsGroups(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name=_('name'))
    intrests = models.ManyToManyField(CatalogAlbum, blank=True,verbose_name=_('intrested'))
    class Meta():
        ordering = ['id',]
    def intrests_list(self):
        return mark_safe('<ul>{}</ul>'.format(''.join(['<li>{}</li>'.format(intrest.title) for intrest in self.intrests.all()])))
    def __str__(self):
        return self.name
# Create your models here.

class MsCrmBusinessSelectToIntrests(models.Model):
    businessSelect = models.OneToOneField(to=MsCrmBusinessTypeSelect, on_delete=models.CASCADE, verbose_name=_('business'))
    intrests = models.ManyToManyField(CatalogAlbum, blank=True, verbose_name=_('intrested'))

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
    intrests = models.ManyToManyField(CatalogAlbum, blank=True, verbose_name=_('intrested'))
    
    def get_clean_phonenumber(self):
        # remove \u2066 and ⁩ and '+'
        # then add one + at the begining and return
        phone = self.phone
        phone = phone.replace('\u200f', '')
        phone = phone.replace('\u202a', '')
        phone = phone.replace('\u202c', '')
        phone = phone.replace('\u200f', '')
        phone = phone.replace('\u2066', '')
        phone = phone.replace('⁩', '')
        phone = phone.replace('+', '')
        if phone.startswith('05'):
            phone = '972' + phone[1:]
        
        return '+' + phone
    




# api_save_lead
class LeadSubmit(models.Model):
    bussiness_name = models.CharField(max_length=100, verbose_name=_('business name'))
    businessType = models.CharField(max_length=254, verbose_name=_('business type'))
    #businessTypeCustom = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('business type custom'))
    address = models.CharField(max_length=100, null=True, blank=True, verbose_name=_('address'))
    name = models.CharField(max_length=100, verbose_name=_('name'))
    phone = models.CharField(max_length=100, verbose_name=_('phone'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    