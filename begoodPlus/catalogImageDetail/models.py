from django.contrib.admin.options import ModelAdmin
from productSize.models import ProductSize
from color.models import Color
from provider.models import Provider
from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.


class CatalogImageDetail(models.Model):

    provider = models.ForeignKey(to=Provider, on_delete=models.CASCADE)
    colors = models.ManyToManyField(to=Color, verbose_name=_('colors'))
    sizes = models.ManyToManyField(to=ProductSize, verbose_name=_('sizes'))

    cost_price = models.FloatField(verbose_name=_(
        'cost price'), blank=False, null=False)
    client_price = models.FloatField(verbose_name=_(
        'store price'),  blank=False, null=False)
    recomended_price = models.FloatField(verbose_name=_(
        'private client price'),  blank=False, null=False)

    providerMakat = models.CharField(verbose_name=_(
        'provider makat'), max_length=75, blank=True, null=True)

    def __str__(self):
        try:
            ret = '[' + self.parent.first().title + ' , ' + \
                self.provider.name + ']'
        except:
            ret = '[' + 'no parent product!' + ' , ' + self.provider.name + ']'
        return ret
