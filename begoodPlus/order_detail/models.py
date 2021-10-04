from django.db import models
from product.models import Product
from productSize.models import ProductSize
from productColor.models import ProductColor
from order.models import Order
from django.utils.translation import gettext_lazy  as _

class OrderDetail(models.Model):
    class Meta:
        verbose_name = _('Order detail')
        verbose_name_plural = _('Order details')
    order = models.ForeignKey(verbose_name=_("order"), to=Order, on_delete=models.CASCADE)
    product = models.ForeignKey(verbose_name=_("product"), to=Product, on_delete=models.CASCADE)
    size = models.ForeignKey(verbose_name=_("size"), to=ProductSize, on_delete=models.CASCADE)
    color = models.ForeignKey(verbose_name=_("color"), to=ProductColor, on_delete=models.CASCADE)
    amount = models.IntegerField(verbose_name=_("amount"))
    add_printing = models.BooleanField(verbose_name=_("add printing"))
    add_embroidery = models.BooleanField(verbose_name=_("add embroidery"))