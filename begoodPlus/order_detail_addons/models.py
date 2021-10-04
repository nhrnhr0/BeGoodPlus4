from django.db import models

from order_detail.models import OrderDetail
from glofa_types.models import GlofaType
from color.models import Color
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class OrderDetailAddons(models.Model):
    class Meta:
        verbose_name = _('Order detail addons')
        verbose_name_plural = _('Order detail addons')
        
    order = models.ForeignKey(to=OrderDetail, on_delete=models.CASCADE)
    is_print = models.BooleanField(verbose_name=_("is print"))
    glofa = models.ForeignKey(to=GlofaType, on_delete=models.CASCADE, verbose_name=_("glofa"))
    color = models.ManyToManyField(to=Color)
    image = models.ImageField(verbose_name=_("logo"))
    logoDescription = models.TextField(verbose_name=_("logo description"))
    
    
    