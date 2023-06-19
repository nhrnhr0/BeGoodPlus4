from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.


class ProductSize(models.Model):

    class Meta():
        verbose_name = _('Product size')
        verbose_name_plural = _('Product sizes')
        ordering = ['order', '-code', ]
        default_related_name = 'productSizes'

    # size = models.CharField(_('size'), default='X', max_length=30, unique=True)
    size = models.CharField(_('size'), default='X',
                            max_length=30, unique=False)
    code = models.CharField(_('code'), default='', max_length=20)
    order = models.PositiveIntegerField(_('order'), default=0)

    def __str__(self):
        return self.size + ' (' + self.code + ')'
