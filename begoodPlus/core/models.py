from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.html import mark_safe
from django.conf import settings

import uuid

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

from base64 import urlsafe_b64decode, urlsafe_b64encode
from uuid import UUID

def uuid2slug(uuidstring):
    if uuidstring:
        return urlsafe_b64encode(uuidstring.bytes).rstrip(b'=').decode('ascii')
    else:
        return '<error>'

def slug2uuid(slug):
    return str(UUID(bytes=urlsafe_b64decode(slug + '==')))


# generate auth token for every new saved user
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

from catalogImages.models import CatalogImage
# Create your models here.
class BeseContactInformation(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=50, null=True,blank=True)
    phone = models.CharField(verbose_name=_("phone"), max_length=30, null=True,blank=True)
    email = models.EmailField(verbose_name=_('email'), max_length=120, blank=True, null=True)
    message = models.TextField(verbose_name=_('message'), max_length=1500, blank=True, null=True)
    url = models.URLField(default='')
    sumbited = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    formUUID = models.UUIDField(unique=True, default='')

    def owner_display(self):
        ret = ''
        for i in self.owner.all():
            ret += f'<div style="font-weight: bold;">{str(i.device)}</div>'
        return mark_safe(ret)
    owner_display.short_description= _('owner')
    class Meta:
        pass
        #unique_together = ('name', 'phone','email','url','sumbited')
        
    def __str__(self):
        url = self.url or 'None'
        name = self.name or 'None'
        phone = self.phone or 'None'
        email = self.email or 'None'
        return url + ' | '  + name + ' | ' +phone + ' | ' + email
    
        

from customerCart.models import CustomerCart
class Customer(models.Model):
    contact = models.ManyToManyField(to=BeseContactInformation, related_name='owner')
    carts = models.ManyToManyField(to=CustomerCart, related_name='owner')
    device = models.CharField(max_length=120, unique=True)

    def get_active_cart(self):
        active_cart,created = self.carts.get_or_create(sumbited=False, defaults={'formUUID':uuid.uuid4(),})
        return active_cart


class UserSearchData(models.Model):
    session = models.CharField(max_length=50)
    term = models.CharField(max_length=50)
    resultCount = models.IntegerField(verbose_name=_('number of results'))
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

from django.utils.html import mark_safe

from colorhash import ColorHash
class SvelteContactFormModal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    device = models.CharField(verbose_name=_('device'), max_length=250)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
    name = models.CharField(verbose_name=_('name'), max_length=120)
    phone = models.CharField(verbose_name=_('phone'), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    message = models.TextField(verbose_name=_('message'))
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)

class SvelteCartModal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True)
    device = models.CharField(verbose_name=_('device'), max_length=250)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
    name = models.CharField(verbose_name=_('name'), max_length=120)
    phone = models.CharField(verbose_name=_('phone'), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    products = models.ManyToManyField(to=CatalogImage, blank=True)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)
    
    

    