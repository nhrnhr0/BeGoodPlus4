from enum import unique
from django.db import models
from catalogImages.models import CatalogImage
from client.models import Client
from django.utils.translation import gettext_lazy  as _
from adminsortable.models import Sortable

# Create your models here.
class AmountBrakepoint(models.Model):
    #text = models.CharField(verbose_name=_('text'), max_length=100)
    number = models.FloatField(verbose_name=_('number'))
    def __str__(self):
        return str(self.number)# + ' ' + self.text
    
class PaymantType(models.Model):
    text = models.CharField(verbose_name=_('text'), max_length=100)
    def __str__(self):
        return self.text

class PriceTable(models.Model):
    #paymentType  = models.ForeignKey(verbose_name=_('payment type'), to=PaymantType, on_delete=models.SET_NULL, null=True,blank=True)
    #amountBrakepoint = models.ForeignKey(verbose_name=_('amount brakepoint'), to=AmountBrakepoint, on_delete=models.SET_NULL, null=True,blank=True)
    #paymentType = models.CharField(verbose_name=_('payment type'), max_length=10, null=True,blank=True, choices=[('מזומן','מזומן'),('שוטף','שוטף'),('אחר','אחר')])
    amount = models.FloatField(verbose_name=_('amount'), null=True,blank=True, default=1)
    
    cach_price = models.FloatField(verbose_name=_('cach price'), default=0)
    credit_price = models.FloatField(verbose_name=_('credit price'), default=0)
    class Meta():
        verbose_name = _('price table')
        verbose_name_plural = _('price tables')
        unique_together = ('amount','cach_price','credit_price')
    def __str__(self):
        return str(self.amount) + ' | ' + str(self.cach_price) + '₪' + ' | ' + str(self.credit_price) + '₪'


class CampainProduct(models.Model):
    catalogImage = models.ForeignKey(verbose_name=_('product'), to=CatalogImage, on_delete=models.SET_NULL, null=True,blank=True)
    monthCampain = models.ForeignKey(verbose_name=_('month campain'), to='MonthCampain', on_delete=models.SET_NULL, null=True,blank=True)
    priceTable = models.ManyToManyField(verbose_name=_('price table'), to=PriceTable,blank=True)
    order = models.PositiveIntegerField(verbose_name=_('order'), default=0, db_index=True)
    #my_order = models.PositiveIntegerField(default=0, blank=False, null=False)
    class Meta():
        ordering = ['order']
        unique_together = ('monthCampain', 'catalogImage')
        pass
    def __str__(self):
        return str(self.catalogImage)# + ' | ' + str(len(self.priceTable.all()))
    
    
class MonthCampain(models.Model):
    is_shown = models.BooleanField(verbose_name=_('is shown'), default=False)
    name = models.CharField(max_length=254, verbose_name=_('name'))
    users = models.ManyToManyField(to=Client, verbose_name=_('users'))
    #products = models.ManyToManyField(to=CampainProduct, verbose_name=_('products'))
    products = models.ManyToManyField(to=CatalogImage, verbose_name=_('products'), through='CampainProduct')