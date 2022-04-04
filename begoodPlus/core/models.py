from urllib import request
from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.html import mark_safe
from django.conf import settings
import json
import uuid
from json2html import *

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from numpy import NaN
import pandas as pd
from rest_framework.authtoken.models import Token
from base64 import urlsafe_b64decode, urlsafe_b64encode
from uuid import UUID
from productColor.models import ProductColor

from productSize.models import ProductSize

def uuid2slug(uuidstring):
    if uuidstring:
        if isinstance(uuidstring, str):
            try:
                return urlsafe_b64encode(bytearray.fromhex(uuidstring)).rstrip(b'=').decode('ascii')            
            except:
                return urlsafe_b64encode(str.encode(uuidstring)).rstrip(b'=').decode('ascii')            
        else:
            return urlsafe_b64encode(uuidstring.bytes).rstrip(b'=').decode('ascii')
    else:
        return '<error>'

def slug2uuid(slug):
    return str(UUID(bytes=urlsafe_b64decode(slug + '==')))


# generate auth token for every new saved user
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

from catalogImages.models import CatalogImage, CatalogImageVarient
# Create your models here.
class BeseContactInformation(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=50, null=True,blank=True)
    phone = models.CharField(verbose_name=_("phone"), max_length=30, null=True,blank=True)
    email = models.EmailField(verbose_name=_('email'), max_length=120, blank=True, null=True)
    message = models.TextField(verbose_name=_('message'), max_length=1500, blank=True, null=True)
    url = models.URLField(default='')
    sumbited = models.BooleanField(default=False)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    formUUID = models.UUIDField(unique=True, default='')

    def owner_display(self):
        ret = ''
        for i in self.owner.all():
            ret += f'<div style="font-weight: bold;">{str(i.device)}</div>'
        return mark_safe(ret)
    owner_display.short_description= _('owner')
    class Meta:
        pass
        #unique_together = ('name', 'phone','email','url','sumbited')
        
    def __str__(self):
        url = self.url or 'None'
        name = self.name or 'None'
        phone = self.phone or 'None'
        email = self.email or 'None'
        return url + ' | '  + name + ' | ' +phone + ' | ' + email
    
        

from customerCart.models import CustomerCart
class Customer(models.Model):
    contact = models.ManyToManyField(to=BeseContactInformation, related_name='owner')
    carts = models.ManyToManyField(to=CustomerCart, related_name='owner')
    device = models.CharField(max_length=120, unique=True)

    def get_active_cart(self):
        active_cart,created = self.carts.get_or_create(sumbited=False, defaults={'formUUID':uuid.uuid4(),})
        return active_cart


class UserSearchData(models.Model):
    session = models.CharField(max_length=50)
    term = models.CharField(max_length=50)
    resultCount = models.IntegerField(verbose_name=_('number of results'))
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

from django.utils.html import mark_safe

from colorhash import ColorHash
class SvelteContactFormModal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    device = models.CharField(verbose_name=_('device'), max_length=250)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
    name = models.CharField(verbose_name=_('name'), max_length=120)
    phone = models.CharField(verbose_name=_('phone'), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    message = models.TextField(verbose_name=_('message'))
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)
    
# through model for many to many relationship between SvelteCartModal and CatalogImage including amount
class SvelteCartProductEntery(models.Model):
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    amount = models.IntegerField(verbose_name=_('amount'), default=1)
    details = models.JSONField(verbose_name=_('details'), blank=True, null=True)
    #cart = models.ForeignKey(to='SvelteCartModal', on_delete=models.CASCADE, null=True, blank=True)
    unitPrice = models.DecimalField(verbose_name=_('unit price'), max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return str(self.amount) + ' - ' + self.product.title
    class Meta:
        pass
        #unique_together = ('cart', 'product')
    
    
class ActiveCartTracker(models.Model):
    data = models.JSONField(verbose_name=_('data'), blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    last_ip = models.CharField(verbose_name=_('last ip'), max_length=120, blank=True, null=True)
    active_cart_id = models.CharField(verbose_name=_('active cart id'), max_length=120, unique=True)
    
    def cart_products_size(self):
        if self.data:
            return len(self.data.keys())
        else:
            return 0
    def cart_products_html_table(self):
        print(self.data)
        html = ''
        if self.data:
            html = json2html.convert(json=self.data)
        return mark_safe(html)
class SvelteCartModal(models.Model):
    doneOrder = models.BooleanField(default=False, verbose_name=_('done order'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, null=True, blank=True, related_name='user_cart')
    device = models.CharField(verbose_name=_('device'), max_length=250)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
    name = models.CharField(verbose_name=_('name'), max_length=120)
    businessName = models.CharField(verbose_name=_('business name'), max_length=120, null=True, blank=True)
    phone = models.CharField(verbose_name=_('phone'), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    products = models.ManyToManyField(to=CatalogImage, blank=True)
    productEntries = models.ManyToManyField(to=SvelteCartProductEntery, blank=True)
    productsRaw = models.TextField(verbose_name=_('raw products'), blank=True, null=True)
    message = models.TextField(verbose_name=_('message'), blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    agent = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='agent')
    def cart_count(self):
        return self.productEntries.count()
    def products_amount_display(self):
        ret = '<ul>'
        for i in self.productEntries.all():
            ret += f'<li><div style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</div></li>'
        ret+= '</ul>'
        return mark_safe(ret)
    def products_amount_display_with_sizes_and_colors(self):
        ret = '<table>'
        all_sizes = ProductSize.objects.all().values('id','size')
        all_colors = ProductColor.objects.all().values('id','name')
        all_varients = CatalogImageVarient.objects.all().values('id','name')
        def get_varient_name(varient_id):
            for i in all_varients:
                if i['id'] == int(varient_id):
                    return i['name']
        def get_size_name(size_id):
            for i in all_sizes:
                if i['id'] == int(size_id):
                    return i['size']
        def get_color_name(color_id):
            color_id = int(color_id)
            for i in all_colors:
                if i['id'] == int(color_id):
                    return i['name']
        
        for i in self.productEntries.all():
            ret += f'<tr><td style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</td>'
            if i.details != None:
                details = i.details
                #detail_table = '<td><table>'
                # i.details = [{"size_id": 90, "color_id": "77", "quantity": 12}, {"size_id": 90, "color_id": "78", "quantity": 35}, {"size_id": 89, "color_id": "79", "quantity": 6}, {"size_id": 88, "color_id": "83", "quantity": 19}, {"size_id": 89, "color_id": "83", "quantity": 7}]
                tableData = []
                
                for color_id in details.keys():
                    for size_id in details[color_id].keys():
                        size = get_size_name(size_id)
                        color = get_color_name(color_id)
                        
                        if 'quantity' in details[color_id][size_id].keys():
                            
                            tableData.append({'size': size, 'color': color, 'varient': '','qyt': details[color_id][size_id]['quantity']})
                        else:
                            for varient_id in details[color_id][size_id].keys():
                                varient = get_varient_name(varient_id)
                                qyt = details[color_id][size_id][varient_id].get('quantity',None)
                                if qyt != None and qyt != 0:
                                    tableData.append({'size': size, 'color': color, 'varient': varient, 'qyt': qyt})
                    
                    
                    #detail_table += f'<tr><td>{size.size}</td><td>{color.name}</td><td>{str(qyt)}</td></tr>'
                #detail_table += '</table></td><hr>'
                #ret += detail_table
                if(len(tableData) > 0):
                    df = pd.DataFrame(tableData)
                    # remove from df rows with qyt == '-' or qyt == 0 or qyt == Nan or qyt == None
                    #df = df[df['qyt'].str.contains('-') == True or df['qyt'].str.contains('0') == True or df['qyt'].str.contains('NaN') == True or df['qyt'].str.contains('None') == True]
                    try:
                        df = df.pivot(index=['color','varient'], columns='size', values='qyt')
                    except Exception as e:
                        print(e)
                    ret += '<td>' + df.to_html(index=True, header=True, table_id='table_id', na_rep='-') + '</td>'
        
            #ret += '<td id="cart-entry-'+str(i.id)+'">'  + '<input type="hidden" name="product_id" value="' + str(i.product.id) + '">' + '<input type="hidden" name="cart_id" value="' + str(self.id) + '">' + '<input type="hidden" name="entry_id" value="' + str(i.id) + '"><button type="button" onclick="remove_product_from_cart(' + str(self.id) + ',' +str(i.id)+')">' + 'מחק' + '</button>' + '</td>'
            ret += '</tr>'
        ret+= '</table>'
        return mark_safe(ret)
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{self.device}</span>'
        return mark_safe(ret)
    
    def turn_to_morder(self):
        from morders.models import MOrder, MOrderItem, MOrderItemEntry
        cart= self
        client = self.user.client
        name = self.name if self.name != '' else self.user.client.businessName
        phone = self.phone if self.phone != '' else self.user.client.contactManPhone
        email = self.email if self.email != '' else self.user.client.email
        message = self.message if self.message != '' else ''
        status = 'new'
        products = self.productEntries.all()
        products_list = []
        for i in products:
            product = i.product
            quantity = i.amount
            details = i.details
            # example details:
            # {'84': {'94': {'quantity': 0}, '95': {'quantity': 0}, '96': {'quantity': 0}, '97': {'quantity': 0}, '98': {'quantity': 0}, '99': {'quantity': 0}, '100': {'quantity': 0}, '101': {'quantity': 0}, '102': {'quantity': 0}, 'quantity': 0}}
            # {'COLOR_ID': {'SIZE_ID': {'VARIANT_ID': {'quantity': 0}...}...}}
            # or 
            # {'COLOR_ID': {'SIZE_ID': {'quantity': 0}...}...}
            price = i.unitPrice
            currentProduct = {'product': product,'price':price}
            entries_list = []
            if len(details) == 0:
                size_id = None
                color_id = None
                varient_id = None
                entries_list.append({'size_id': size_id, 'color_id': color_id, 'varient_id': varient_id, 'quantity': quantity})
            for color_id in details.keys():
                for size_id in details[color_id].keys():
                    if 'quantity' in details[color_id][size_id].keys():
                        quantity = details[color_id][size_id].get('quantity',None)
                        
                        
                        #products_list.append({'product': product,'price':price, 'quantity': quantity, 'color_id': color_id, 'size_id': size_id, 'varient_id': None})
                        if quantity != None and quantity != 0:
                            entries_list.append({'size_id': size_id, 'color_id': color_id, 'varient_id': None, 'quantity': quantity})
                        
                    else:
                        for varient_id in details[color_id][size_id].keys():
                            quantity = details[color_id][size_id][varient_id].get('quantity', None)
                            #products_list.append({'product': product,'price':price, 'quantity': quantity, 'color_id': color_id, 'size_id': size_id, 'varient_id': varient_id})
                            if quantity != None and quantity != 0:
                                entries_list.append({'size_id': size_id, 'color_id': color_id, 'varient_id': varient_id, 'quantity': quantity})
            currentProduct['entries'] = entries_list
            products_list.append(currentProduct)
        #order_product = [MOrderItem(product=i['product'], price=i['price']) for i in products_list]
        #MOrderItem.objects.bulk_create(order_product)
        dbProducts = []
        for product in products_list:
                dbEntries = [MOrderItemEntry(size_id=entry['size_id'], color_id=entry['color_id'], varient_id=entry['varient_id'], quantity=entry['quantity']) for entry in product['entries']]
                dbEntries = MOrderItemEntry.objects.bulk_create(dbEntries)
                
                dbProduct = MOrderItem.objects.create(product=product['product'], price=product['price'])
                dbProduct.entries.set(dbEntries)
                dbProducts.append(dbProduct)
        morder = MOrder.objects.create(cart=cart,client=client,name=name,phone=phone,email=email,status=status, message=message)
        morder.products.add(*dbProducts)