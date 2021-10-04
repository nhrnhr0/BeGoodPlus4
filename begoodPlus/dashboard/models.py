from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.conf import settings
from stock.models import Stock

# Create your models here.
class Stores(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=120)
    currentInventory = models.ForeignKey(to='Inventory', on_delete=models.CASCADE, related_name='currentInv', null=True, default=None)
    targetInventory = models.ForeignKey(to='Inventory', on_delete=models.CASCADE, related_name='targetInv', null=True, default=None)


class Inventory(models.Model):
    owner = models.ForeignKey( settings.AUTH_USER_MODEL,on_delete=models.CASCADE,null=True, default=None)
    date = models.DateTimeField(verbose_name=_('date'),auto_now_add=True)
    entries = models.ManyToManyField(to='InventoryEntry')

    def __str__(self):
        return str(self.date) + ' - ' + str(self.owner)


class InventoryEntry(models.Model):
    stock = models.ForeignKey(to=Stock, on_delete=models.CASCADE)
    amount = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return str(self.stock) + ' - ' + str(self.amount)


