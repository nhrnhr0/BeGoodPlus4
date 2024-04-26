from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class ProductSizeGroup(models.Model):

    class Meta():
        verbose_name = _('Product size group')
        verbose_name_plural = _('Product size groups')
        ordering = ['name', ]
    name = models.CharField(_('name'), max_length=100, unique=True)

    def __str__(self):
        return self.name

class ProductSize(models.Model):

    class Meta():
        verbose_name = _('Product size')
        verbose_name_plural = _('Product sizes')
        ordering = ['group','order', '-size', ]
        default_related_name = 'productSizes'

    # size = models.CharField(_('size'), default='X', max_length=30, unique=True)
    size = models.CharField(_('size'), default='X',
                            max_length=30, unique=False)
    #code = models.CharField(_('code'), default='', max_length=20)
    order = models.PositiveIntegerField(_('order'), default=0)
    group = models.ForeignKey(
        to=ProductSizeGroup, on_delete=models.SET_NULL, related_name='sizes', null=True, blank=True)
    def __str__(self):
        if self.group is None:
            return self.size
        return self.size + ' (' + self.group.name + ')'
