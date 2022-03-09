import imp
from multiprocessing.connection import Client
from statistics import variance
import pandas as pd
from django.db import models
from catalogImages.models import CatalogImage
from client.models import Client
from color.models import Color
from core.models import SvelteCartModal
from productSize.models import ProductSize
from catalogImages.models import CatalogImageVarient
from provider.models import Provider
from django.utils.html import mark_safe




class MOrderItem(models.Model):
    """
    This is the model for the items in the order.
    """
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    color = models.ForeignKey(to=Color, on_delete=models.CASCADE)
    size = models.ForeignKey(to=ProductSize, on_delete=models.CASCADE)
    varient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    clientProvider = models.CharField(max_length=255, null=True, blank=True)
    clientBuyPrice = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ergent = models.BooleanField(default=False)
    prining = models.BooleanField(default=False)
    embroidery = models.BooleanField(default=False)
    comment = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return str(self.product) + " " + str(self.quantity) + " - " + str(self.price) + '₪' #str(self.color) + " " + str(self.size) + (" " + self.varient.name) if self.varient != None else ' ' + str(self.quantity) + " " + str(self.price) + '₪'
# Create your models here.
class MOrder(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    cart = models.ForeignKey(to=SvelteCartModal, on_delete=models.SET_NULL, null=True)
    client = models.ForeignKey(to=Client, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    status = models.CharField(max_length=100, choices=[('new', 'חדש'), ('in_progress', 'בתהליך'), ('done', 'גמור')])
    products = models.ManyToManyField(to=MOrderItem, blank=True)
    message = models.TextField(null=True, blank=True)
    
    def products_display(self):
        products = []
        qs = self.products.all().prefetch_related('product', 'size', 'color', 'varient', 'provider')
        for p in qs:
            products.append({'product': p.product.title, 'quantity': int(p.quantity), 'price': p.price, 'color': p.color.name, 'size': p.size.size, 'varient': p.varient, 'comment': p.comment, 'clientBuyPrice':p.clientBuyPrice, 'clientProvider': p.clientProvider, 'provider': p.provider.name})
        try:
            df = pd.DataFrame(products)
        except Exception as e:
            print(e)
            return ' '
        print(df.columns)
        print(df.head())
        #df['cell_display'] = df['quantity'].astype(str)# + ' ' + df['price'].astype(str) + '₪'
        #df['price_display'] = df['price'] + '₪'
        if len(df) == 0:
            return mark_safe(df.to_html(index=False))
        df = df.pivot(index=['product', 'color', 'varient', 'price'], columns='size', values=['quantity'])
        
        print(df.columns)
        print(df.head())
        html = df.to_html(index=True, header=True, table_id='table_id', na_rep='-')
        return mark_safe(html)