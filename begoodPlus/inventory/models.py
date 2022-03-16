from audioop import reverse
from django.conf import settings
from django.db import models
from provider.models import Provider
from catalogImages.models import CatalogImage, CatalogImageVarient
from django.db.models.signals import pre_save
from django.dispatch import receiver
from productSize.models import ProductSize
from color.models import Color
from django.utils.html import mark_safe
# Create your models here.

# PPN - ProviderProductName
# - product_id - FK Product
# - provider_id - FK Provider
# - providerProductName
# - fastProductTitle - text - autofill with product->title
# provider_id & providerProductName are unique together
class PPN(models.Model):
    product = models.ForeignKey(to=CatalogImage, on_delete=models.DO_NOTHING)
    provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    providerProductName = models.CharField(max_length=100)
    #fastProductTitle = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('provider', 'providerProductName')
    def __str__(self):
        return self.providerProductName
#@receiver(pre_save, sender=PPN)
#def set_PPN_product_title(sender, instance, *args, **kwargs):
#    instance.fastProductTitle = instance.product.title


class WarehouseStock(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sku = models.ForeignKey(to='SKUM', null=True, on_delete=models.SET_NULL)
    quantity = models.IntegerField()
    avgPrice = models.DecimalField(max_digits=10, decimal_places=3)
    buyHistory = models.ManyToManyField(to='ProductEnterItems', related_name='buyHistory', blank=True)

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    stock = models.ManyToManyField(to=WarehouseStock, blank=True, related_name='warehouse')
    def __str__(self):
        return self.name


# DocStockEnter - document of stock enter to warehouse from provider
# - created_at
# - from FK Provider
# - to FK Warehouse
# - items - M2M(ProductEnterItems)
# - isAplied - boolean
# - byUser - User
class DocStockEnter(models.Model):
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    warehouse = models.ForeignKey(to=Warehouse, on_delete=models.SET_DEFAULT, default=1)
    items = models.ManyToManyField(to='ProductEnterItems', related_name='DocStockEnter')
    isAplied = models.BooleanField(default=False)
    byUser = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    def get_admin_edit_url(self):
        url = ''
        if self.id:
            url = settings.MY_DOMAIN + '/inv/doc-stock-enter/' + str(self.id)
        return mark_safe('<a href="' + url + '">' + 'ערוך' + '</a>')
    class Meta:
        ordering = ('-created_at',)

# SKUM - map of SKU to Product, Provider and the name of the product in the provider system
# ppn_id - FK PPN
# size_id - FK productSize
# color_id - FK ProductColor
# verient - FK ProductVerient (NULL)
class SKUM(models.Model):
    ppn = models.ForeignKey(to=PPN, on_delete=models.SET_NULL, null=True, blank=True)
    size = models.ForeignKey(to=ProductSize, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(to=Color, on_delete=models.SET_NULL, null=True, blank=True)
    verient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('ppn', 'size', 'color', 'verient')
    def __str__(self):
        s = '' + self.ppn.providerProductName + ' | ' + str(self.size.size) + ' | ' + str(self.color.name)
        if self.verient:
            s += ' | ' + str(self.verient.name)
        return s
    def selfDisplay(self):
        s = '' + self.ppn.product.title + ' | ' + str(self.size.size) + ' | ' + str(self.color.name)
        if self.verient:
            s += ' | ' + str(self.verient.name)
        return s
# ProductEnterItems - items of product enter to warehouse from provider
# - sku  - FK SKUM
# - amount - int
# - price - float
class ProductEnterItems(models.Model):
    sku = models.ForeignKey(to=SKUM, on_delete=models.SET_DEFAULT, default=1)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=3)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return str(self.sku.selfDisplay()) + ' | כמות: ' + str(self.quantity) + ' | ' + str(self.price) + '₪'
# Warehouse - 
# name String
