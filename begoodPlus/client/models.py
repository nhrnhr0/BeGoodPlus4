from django.db import models
from django.db.models.fields.related import OneToOneField
from django.utils.translation import gettext_lazy  as _

from catalogAlbum.models import CatalogAlbum
from django.contrib.auth.models import User

# Create your models here.

class ClientType(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=120)
    
    def __str__(self):
        return self.name

class ClientOrganizations(models.Model):
    name= models.CharField(verbose_name=_('name'), max_length=255)
    def __str__(self):
        return self.name
    
class PaymantWay(models.Model):
    name=models.CharField(verbose_name=_('name'), max_length=100)
    def __str__(self):
        return self.name

class PaymentTime(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=100)
    def __str__(self):
        return self.name


class Client(models.Model):
    
    user = OneToOneField(to=User,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_('user'))
    businessName = models.CharField(verbose_name=_('business name '), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    extraName = models.CharField(verbose_name=_('extra name'), max_length=120, null=True,blank=True)
    storeType = models.ForeignKey( verbose_name=_('store type'), to=ClientType,on_delete=models.SET_NULL, null=True)
    categorys = models.ManyToManyField(verbose_name=_('categories'), to=CatalogAlbum, blank=True)
    tariff = models.SmallIntegerField(verbose_name=_('tariff (%)'), default=0)
    privateCompany = models.CharField(max_length=254, verbose_name=_('P.C.'))
    address = models.CharField(verbose_name=_('address'), max_length=511)
    contactMan = models.CharField(verbose_name=_('contact man'),max_length=100)
    contactManPosition = models.CharField(verbose_name=_('contact man position'), max_length=100)
    contactManPhone = models.CharField(verbose_name=_('contact man phone'),max_length=100)
    contactMan2 = models.CharField(verbose_name=_('contact man 2'),max_length=100, blank=True, null=True)
    contactMan2Phone = models.CharField(verbose_name=_('contact man 2 phone'),max_length=100, blank=True, null=True)
    officePhone = models.CharField(verbose_name=_('office phone'), max_length=100, blank=True, null=True)
    extraMail = models.EmailField(verbose_name=_('extra email'), max_length=100, blank=True, null=True)
    organization = models.ForeignKey(verbose_name=_('organization'),  to=ClientOrganizations, on_delete=models.SET_NULL, null=True,blank=True)
    howPay = models.ForeignKey(verbose_name=_('payment way'), to=PaymantWay, on_delete=models.PROTECT)
    whenPay = models.ForeignKey(verbose_name=_('payment time'), to=PaymentTime, on_delete=models.PROTECT)
    isWithholdingTax = models.BooleanField(verbose_name=_('IsWithholdingTax'), default=False)
    availabilityHours = models.TextField(verbose_name=_('availability hours'), blank=True)
    availabilityDays = models.TextField(verbose_name=_('availability days'), blank=True)
    comment = models.TextField(verbose_name=_('comments'), blank=True, null=True)
    
