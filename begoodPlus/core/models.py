from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

import uuid
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
    
    class Meta:
        pass
        #unique_together = ('name', 'phone','email','url','sumbited')
        
    def __str__(self):
        url = self.url or 'None'
        name = self.name or 'None'
        phone = self.phone or 'None'
        email = self.email or 'None'
        return url + ' | '  + name + ' | ' +phone + ' | ' + email
    
        
import uuid
from customerCart.models import CustomerCart
class Customer(models.Model):
    contact = models.ManyToManyField(to=BeseContactInformation)
    carts = models.ManyToManyField(to=CustomerCart)
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
