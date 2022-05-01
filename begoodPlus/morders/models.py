from django.urls import reverse

from multiprocessing.connection import Client
import pandas as pd
from django.db import models
from django.contrib.auth.models import User
from catalogImages.models import CatalogImage
from client.models import Client
from color.models import Color
from core.models import SvelteCartModal
from productSize.models import ProductSize
from catalogImages.models import CatalogImageVarient
from provider.models import Provider
from django.utils.html import mark_safe


class MOrderItemEntry(models.Model):
    quantity = models.IntegerField(default=1)
    color = models.ForeignKey(to=Color, on_delete=models.SET_DEFAULT,default=76, null=True, blank=True)
    size = models.ForeignKey(to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    varient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return str(self.quantity) + ' ' + str(self.color) + ' ' + str(self.size) + ' ' + str(self.varient)
    pass

    

class MOrderItem(models.Model):
    """
    This is the model for the items in the order.
    """
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    #quantity = models.IntegerField(default=1)
    #color = models.ForeignKey(to=Color, on_delete=models.SET_DEFAULT,default=76, null=True, blank=True)
    #size = models.ForeignKey(to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    #varient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    #provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    providers = models.ManyToManyField(to=Provider, blank=True)
    #clientProvider = models.CharField(max_length=255, null=True, blank=True)
    #clientBuyPrice = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ergent = models.BooleanField(default=False)
    prining = models.BooleanField(default=False)
    embroidery = models.BooleanField(default=False)
    comment = models.TextField(null=True, blank=True)
    entries = models.ManyToManyField(to=MOrderItemEntry, blank=True, related_name='product')
    prop_totalEntriesQuantity = property(lambda self: sum([entry.quantity for entry in self.entries.all()]))
    prop_totalPrice = property(lambda self: self.prop_totalEntriesQuantity * self.price)
    def __str__(self):
        return str(self.product) + " | " + str(self.price) + '₪' #str(self.color) + " " + str(self.size) + (" " + self.varient.name) if self.varient != None else ' ' + str(self.quantity) + " " + str(self.price) + '₪'
# Create your models here.
class MOrder(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    cart = models.ForeignKey(to=SvelteCartModal, on_delete=models.SET_NULL, null=True)
    client = models.ForeignKey(to=Client, on_delete=models.SET_NULL, null=True)
    agent = models.ForeignKey(to=User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    status = models.CharField(max_length=100, choices=[('new', 'חדש'), ('in_progress', 'בתהליך'), ('done', 'גמור')])
    products = models.ManyToManyField(to=MOrderItem, blank=True, related_name='morder')
    message = models.TextField(null=True, blank=True)
    prop_totalPrice = property(lambda self: sum([item.prop_totalPrice for item in self.products.all()]))
    def view_morder_pdf_link(self):
        link = reverse('view_morder_pdf', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'הצג הזמנה'))
    
    def get_edit_url(self):
        link = reverse('admin_edit_order', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'ערוך'))

    def products_display(self):
        products = []
        qs = self.products.all().prefetch_related('product', 'size', 'color', 'varient', 'provider')
        for p in qs:
            size = p.size.size if p.size != None else ' '
            color = p.color.name if p.color != None else ' '
            verient = p.varient.name if p.varient != None else ' '
            products.append({'product': p.product.title, 'quantity': int(p.quantity), 'price': p.price, 'color': color, 'size': size, 'varient': verient, 'comment': p.comment, 'clientBuyPrice':p.clientBuyPrice, 'clientProvider': p.clientProvider, 'provider': p.provider.name})
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