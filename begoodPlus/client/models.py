import uuid
from django.utils.safestring import mark_safe
from colorhash import ColorHash
from django.db import models
from core.models import uuid2slug
from django.db.models.fields.related import OneToOneField
from django.utils.translation import gettext_lazy  as _
from django.conf import settings

from catalogAlbum.models import CatalogAlbum
from django.contrib.auth.models import User

# Create your models here.
class UserLogEntry(models.Model):
    #user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,null=True, blank=True)
    #uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True,default=uuid.uuid4)
    #device = models.CharField(verbose_name=_('device'), max_length=100, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra = models.JSONField(default=dict)
    def __str__(self):
        newExtra = self.extra
        del newExtra['a']
        del newExtra['timestemp']
        return self.timestamp.strftime("%d/%m/%Y, %H:%M:%S.%f")[:-3] + ' || ' + self.action + ' || ' + str(self.extra)
    

    
class UserSessionLogger(models.Model):
    user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,null=True, blank=True)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True,default=uuid.uuid4)
    device = models.CharField(verbose_name=_('device'), max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    session_start_timestemp = models.DateTimeField(auto_now_add=True)
    session_end_timestemp = models.DateTimeField(null=True, blank=True)
    logs = models.ManyToManyField(to=UserLogEntry,blank=True, related_name='logs')
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)

    
    def session_duration(self):
        if self.session_end_timestemp:
            return str(self.session_end_timestemp - self.session_start_timestemp)[:-3]
        else:
            return '-'
    session_duration.short_description = _('session duration')




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
    howPay = models.ForeignKey(verbose_name=_('payment way'), to=PaymantWay, on_delete=models.PROTECT, null=True,blank=True)
    whenPay = models.ForeignKey(verbose_name=_('payment time'), to=PaymentTime, on_delete=models.PROTECT, null=True,blank=True)
    isWithholdingTax = models.BooleanField(verbose_name=_('IsWithholdingTax'), default=False)
    #availabilityHours = models.TextField(verbose_name=_('availability hours'), blank=True)
    #availabilityDays = models.TextField(verbose_name=_('availability days'), blank=True)
    
    sunday = models.CharField(verbose_name=_('sunday'), max_length=100, blank=True, null=True)
    monday = models.CharField(verbose_name=_('monday'), max_length=100, blank=True, null=True)
    tuesday = models.CharField(verbose_name=_('tuesday'), max_length=100, blank=True, null=True)
    wednesday = models.CharField(verbose_name=_('wednesday'), max_length=100, blank=True, null=True)
    thursday = models.CharField(verbose_name=_('thursday'), max_length=100, blank=True, null=True)
    friday = models.CharField(verbose_name=_('friday'), max_length=100, blank=True, null=True)
    saturday = models.CharField(verbose_name=_('saturday'), max_length=100, blank=True, null=True)
    
    comment = models.TextField(verbose_name=_('comments'), blank=True, null=True)
    
