from http import client
from itertools import product
from django.db import models
from django.utils.translation import gettext_lazy as _
from catalogImages.models import CatalogImage
from client.models import Client

from catalogAlbum.models import CatalogAlbum
from django.utils.html import mark_safe


class MsCrmBusinessTypeSelect(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta():
        ordering = ['id', ]

    def __str__(self):
        return self.name

    def __repr__(self) -> str:
        return self.name


class MsCrmIntrest(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta():
        ordering = ['id', ]

    def __str__(self):
        return self.name


class MsCrmIntrestsGroups(models.Model):
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_('name'))
    intrests = models.ManyToManyField(
        CatalogAlbum, blank=True, verbose_name=_('intrested'))

    class Meta():
        ordering = ['id', ]

    def intrests_list(self):
        return mark_safe('<ul>{}</ul>'.format(''.join(['<li>{}</li>'.format(intrest.title) for intrest in self.intrests.all()])))

    def __str__(self):
        return self.name
# Create your models here.


class MsCrmUser(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    businessName = models.CharField(
        max_length=100, verbose_name=_('business name'))
    businessSelect = models.ForeignKey(
        to=MsCrmBusinessTypeSelect, on_delete=models.SET_NULL, verbose_name=_('business'), null=True, blank=True)
    businessTypeCustom = models.CharField(
        max_length=100, null=True, blank=True, verbose_name=_('business type custom'))
    name = models.CharField(max_length=100, verbose_name=_('name'))
    phone = models.CharField(max_length=100, null=True,
                             blank=True, verbose_name=_('phone'))
    email = models.EmailField(
        max_length=100, null=True, blank=True, verbose_name=_('email'))
    address = models.CharField(
        max_length=100, null=True, blank=True, verbose_name=_('address'))
    want_emails = models.BooleanField(
        default=True, verbose_name=_('want emails'))
    want_whatsapp = models.BooleanField(
        default=True, verbose_name=_('want whatsapp'))
    flashy_contact_id = models.CharField(
        max_length=256, null=True, blank=True, verbose_name=_('flashy contact id'))
    intrests = models.ManyToManyField(
        CatalogAlbum, blank=True, verbose_name=_('intrested'))
    clients = models.ManyToManyField(
        to=Client, blank=True, verbose_name=_('clients'))

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


class MsCrmWhatsappMessage(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    message = models.TextField(verbose_name=_('message'))


class MsCrmWhasappImageProduct(models.Model):
    product = models.ForeignKey(
        to=CatalogImage, on_delete=models.CASCADE, verbose_name=_('products'))
    max_width = models.IntegerField(verbose_name=('maxWidth'))
    left = models.IntegerField(verbose_name=('left'))
    top = models.IntegerField(verbose_name=('top'))
    whatsapp_message = models.ForeignKey(
        to=MsCrmWhatsappMessage, on_delete=models.CASCADE, verbose_name=('whatsappMessage'), related_name='whatsappImageProducts')


class MsCrmWhatsappMessagesSent(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    crmUser = models.ForeignKey(
        to=MsCrmUser, on_delete=models.CASCADE, verbose_name=_('crmUser'), related_name='whatsappMessagesSent')
    whatsapp_message = models.ForeignKey(
        to=MsCrmWhatsappMessage, verbose_name=('whatsappMessage'), related_name='whatsappMessagesSent', on_delete=models.CASCADE)

    class Meta():
        ordering = ['created_at', ]
