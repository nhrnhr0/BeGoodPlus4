from django.db import models
from django.utils.translation import gettext_lazy  as _

# Create your models here.
from catalogImages.models import CatalogImage
from core.models import BeseContactInformation


class CustomerCart(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=50, null=True,blank=True)
    phone = models.CharField(verbose_name=_("phone"), max_length=30, null=True,blank=True)
    email = models.EmailField(verbose_name=_('email'), max_length=120, blank=True, null=True)
    products = models.ManyToManyField(to=CatalogImage)
    sumbited = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    formUUID = models.UUIDField(unique=True, default='')
