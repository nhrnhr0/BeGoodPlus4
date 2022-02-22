from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.html import mark_safe
from django.conf import settings
import json
import uuid
from json2html import *

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from numpy import NaN
import pandas as pd
from rest_framework.authtoken.models import Token

from base64 import urlsafe_b64decode, urlsafe_b64encode
from uuid import UUID
from productColor.models import ProductColor

from productSize.models import ProductSize

def uuid2slug(uuidstring):
    if uuidstring:
        if isinstance(uuidstring, str):
            try:
                return urlsafe_b64encode(bytearray.fromhex(uuidstring)).rstrip(b'=').decode('ascii')            
            except:
                return urlsafe_b64encode(str.encode(uuidstring)).rstrip(b'=').decode('ascii')            
        else:
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
    
# through model for many to many relationship between SvelteCartModal and CatalogImage including amount
class SvelteCartProductEntery(models.Model):
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    amount = models.IntegerField(verbose_name=_('amount'), default=1)
    details = models.JSONField(verbose_name=_('details'), blank=True, null=True)
    def __str__(self):
        return str(self.amount) + ' - ' + self.product.title
    class Meta:
        pass
        #unique_together = ('cart', 'product')
    
    
class ActiveCartTracker(models.Model):
    data = models.JSONField(verbose_name=_('data'), blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    last_ip = models.CharField(verbose_name=_('last ip'), max_length=120, blank=True, null=True)
    active_cart_id = models.CharField(verbose_name=_('active cart id'), max_length=120, unique=True)
    
    def cart_products_size(self):
        if self.data:
            return len(self.data.keys())
        else:
            return 0
    def cart_products_html_table(self):
        print(self.data)
        html = ''
        if self.data:
            html = json2html.convert(json=self.data)
        return mark_safe(html)
class SvelteCartModal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True)
    device = models.CharField(verbose_name=_('device'), max_length=250)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
    name = models.CharField(verbose_name=_('name'), max_length=120)
    businessName = models.CharField(verbose_name=_('business name'), max_length=120, null=True, blank=True)
    phone = models.CharField(verbose_name=_('phone'), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    products = models.ManyToManyField(to=CatalogImage, blank=True)
    productEntries = models.ManyToManyField(to=SvelteCartProductEntery, blank=True)
    message = models.TextField(verbose_name=_('message'), blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    def products_amount_display(self):
        ret = '<ul>'
        for i in self.productEntries.all():
            ret += f'<li><div style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</div></li>'
        ret+= '</ul>'
        return mark_safe(ret)
    def products_amount_display_with_sizes_and_colors(self):
        ret = '<table>'
        for i in self.productEntries.all():
            ret += f'<tr><td style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</td>'
            if i.details != None:
                details = i.details
                #detail_table = '<td><table>'
                # i.details = [{"size_id": 90, "color_id": "77", "quantity": 12}, {"size_id": 90, "color_id": "78", "quantity": 35}, {"size_id": 89, "color_id": "79", "quantity": 6}, {"size_id": 88, "color_id": "83", "quantity": 19}, {"size_id": 89, "color_id": "83", "quantity": 7}]
                tableData = []
                for detail in details:
                    size = ProductSize.objects.get(pk=detail['size_id']).size
                    color = ProductColor.objects.get(pk=detail['color_id']).name
                    qyt = detail['quantity'] if 'quantity' in detail else '-'
                    tableData.append({'size':size, 'color':color, 'qyt':qyt})
                    #detail_table += f'<tr><td>{size.size}</td><td>{color.name}</td><td>{str(qyt)}</td></tr>'
                #detail_table += '</table></td><hr>'
                #ret += detail_table
                if(len(tableData) > 0):
                    df = pd.DataFrame(tableData)
                    # remove from df rows with qyt == '-' or qyt == 0 or qyt == Nan or qyt == None
                    #df = df[df['qyt'].str.contains('-') == True or df['qyt'].str.contains('0') == True or df['qyt'].str.contains('NaN') == True or df['qyt'].str.contains('None') == True]
                    df = df.pivot(index='color', columns='size', values='qyt')
                    ret += '<td>' + df.to_html(index=True, header=True, table_id='table_id', na_rep='-') + '</td>'
            ret += '</tr>'
        ret+= '</table>'
        return mark_safe(ret)
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)
    
    

    