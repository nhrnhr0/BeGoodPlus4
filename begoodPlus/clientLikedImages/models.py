from django.db import models
from catalogImages.models import CatalogImage
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class ClientLikedImage(models.Model):
    name = models.CharField(verbose_name=_("name"), max_length=50)
    email = models.EmailField(verbose_name=_("email"), blank=True, null=True)
    tel = models.CharField(verbose_name=_("phone number"), max_length=30)
    msg = models.TextField(verbose_name=_("message"), blank=True, null=True)
    images = models.ManyToManyField(to=CatalogImage)
    submit_date = models.DateTimeField(verbose_name=_("submited date"), auto_now=True)
    
