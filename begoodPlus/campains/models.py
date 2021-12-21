from django.db import models
from catalogImages.models import CatalogImage
from client.models import Client
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class AmountBrakepoint(models.Model):
    text = models.CharField(verbose_name=_('text'), max_length=100)
    number = models.FloatField(verbose_name=_('number'))
    def __str__(self):
        return str(self.number) + ' ' + self.text
    
class PaymantType(models.Model):
    text = models.CharField(verbose_name=_('text'), max_length=100)
    def __str__(self):
        return self.text

class PriceTable(models.Model):
    paymentType  = models.ForeignKey(verbose_name=_('payment type'), to=PaymantType, on_delete=models.SET_NULL, null=True,blank=True)
    amountBrakepoint = models.ForeignKey(verbose_name=_('amount brakepoint'), to=AmountBrakepoint, on_delete=models.SET_NULL, null=True,blank=True)
    price = models.FloatField(verbose_name=_('price'), default=0)
    def __str__(self):
        return str(self.paymentType) + ' | ' + str(self.amountBrakepoint) + ' | ' + str(self.price) + '₪'
class CampainProduct(models.Model):
    product = models.ForeignKey(verbose_name=_('product'), to=CatalogImage, on_delete=models.CASCADE)
    priceTable = models.ForeignKey(verbose_name=_('price table'), to=PriceTable, on_delete=models.CASCADE)
    def __str__(self):
        return str(self.product) + ' | ' + str(self.priceTable)
class MonthCampain(models.Model):
    is_shown = models.BooleanField(verbose_name=_('is shown'), default=False)
    name = models.CharField(max_length=254, verbose_name=_('name'))
    users = models.ManyToManyField(to=Client, verbose_name=_('users'))
    products = models.ManyToManyField(to=CampainProduct, verbose_name=_('products'))