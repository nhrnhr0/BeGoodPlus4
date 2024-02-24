from django.db import models
from django.utils.translation import gettext_lazy as _
from productSizeGroup.models import productSizeGroup
# Create your models here.


class ProductSize(models.Model):

    class Meta():
        verbose_name = _('Product size')
        verbose_name_plural = _('Product sizes')
        ordering = ['size_group','order', ]
        default_related_name = 'productSizes'

    # size = models.CharField(_('size'), default='X', max_length=30, unique=True)
    size = models.CharField(_('size'), default='X',
                            max_length=30, unique=False)
    # code = models.CharField(_('code'), default='', max_length=20)
    order = models.PositiveIntegerField(_('order'), default=0)
    size_group = models.ForeignKey(to=productSizeGroup, on_delete=models.CASCADE, related_name='productSizes', null=True, blank=True)
    def __str__(self):
        return self.size + ' (' + self.code + ')'
