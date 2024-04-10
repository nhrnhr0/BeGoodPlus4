from django.db import models
from catalogImages.models import CatalogImage, CatalogImageVarient, Color, ProductSize

class CartItemEntry(models.Model):
    quantity = models.IntegerField(default=1)
    color = models.ForeignKey(
        to=Color, on_delete=models.SET_DEFAULT, default=76, null=True, blank=True)
    size = models.ForeignKey(
        to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    varient = models.ForeignKey(
        to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return str(self.quantity) + ' ' + str(self.color) + ' ' + str(self.size) + ' ' + str(self.varient)
    pass

class CartItem(models.Model):
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    entries = models.ManyToManyField(
        to=CartItemEntry, blank=True, related_name='orderItem')
    # has_varients = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['product__title', ]
    # def has_varients_ckeck(self):
    #     if self.id:
    #         return self.entries.filter(varient__isnull=False).exists()
    
    # def __save__(self, *args, **kwargs):
    #     self.has_varients = self.has_varients_ckeck()
    #     super(CartItem, self).save(*args, **kwargs)
    
    def __str__(self):
        return self.product.title

# Create your models here.
class Cart(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=100, blank=True, null=True)
    privateCompany = models.CharField(max_length=100, blank=True, verbose_name='ח.פ', null=True)
    message = models.TextField(blank=True, null=True)
    is_inventory_check = models.BooleanField(default=False)
    is_order = models.BooleanField(default=False)
    is_price_proposal = models.BooleanField(default=False)

    products = models.ManyToManyField(
            to=CartItem, blank=True, related_name='mycart')
    
    