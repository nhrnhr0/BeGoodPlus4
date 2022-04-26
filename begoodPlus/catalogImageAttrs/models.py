from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.utils.html import mark_safe


# Create your models here.
class ProductPriceEntry(models.Model):
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount = models.IntegerField(default=0)
    class Meta():
        verbose_name = _('catalog image client price entry')
        verbose_name_plural = _('catalog image client price entries')
        ordering = ['amount']
    def __str__(self) -> str:
        return str(self.price) + '₪ - ' + str(self.amount)


class ProductPrices(models.Model):
    prices = models.ManyToManyField(ProductPriceEntry, blank=True) 
    last_modified = models.DateTimeField(auto_now=True)
    
    def price_table_display(self):
        ret = '<table>'
        for p in self.prices.all():
            ret += '<tr><td>' + str(p.price) + '₪</td><td>' + str(p.amount) + '</td></tr>'
        ret += '</table>'
        return mark_safe(ret)
    def __str__(self):
        # <id>) <last_modified:HH:mm:ss DD/MM/YYYY>
        return str(self.id) + ') ' + str(self.last_modified.strftime('%H:%M:%S %d/%m/%Y'))