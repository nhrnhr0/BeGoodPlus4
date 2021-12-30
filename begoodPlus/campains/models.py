from enum import unique
from django.db import models
from catalogAlbum.models import ThroughImage
from catalogImages.models import CatalogImage
from client.models import Client
from django.utils.translation import gettext_lazy  as _
from adminsortable.models import Sortable
from catalogAlbum.models import CatalogAlbum
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
    
from datetime import datetime
class MonthCampain(models.Model):
    is_shown = models.BooleanField(verbose_name=_('is shown'), default=False)
    name = models.CharField(max_length=254, verbose_name=_('name'))
    users = models.ManyToManyField(to=Client, verbose_name=_('users'), blank=True)
    startTime = models.DateTimeField(verbose_name=_('start time'), default=datetime.now, blank=True)
    endTime = models.DateTimeField(verbose_name=_('end time'), default=datetime.now, blank=True)
    #products = models.ManyToManyField(to=CampainProduct, verbose_name=_('products'))
    products = models.ManyToManyField(to=CatalogImage, verbose_name=_('products'), through='CampainProduct')
    album = models.ForeignKey(to=CatalogAlbum, verbose_name=_('album'), on_delete=models.SET_NULL, null=True,blank=True)
    
    def show_users(self):
        return ', '.join([str(user) for user in self.users.all()])
    
    def show_products(self):
        return ', '.join([str(product) for product in self.products.all()])
    
    def save(self, *args, **kwargs):
        if self.album == None:
            #title,slug,description,fotter,keywords,images,parent,is_public 
            self.album = CatalogAlbum.objects.create(title=self.name,slug='campain_'+self.name, description='', fotter='',keywords='',parent=None, is_public=False, is_campain=True)
        print(self.album.images.count())
        self.album.images.clear()
        print(self.album.images.count())
        if self.id != None:
            for product in self.products.all():
                print(product, self.album,product.campainproduct_set.all()[0].order)
                img, is_created = ThroughImage.objects.get_or_create(catalogImage=product, catalogAlbum=self.album,image_order=product.campainproduct_set.all()[0].order)
                img.image_order = product.campainproduct_set.all()[0].order
                img.save()
                #self.album.images.add(product)
                print(img, is_created)
        super(MonthCampain, self).save(*args, **kwargs)
        #[a[0] for a in list(self.products.values_list('id'))]
#catalogImage,catalogAlbum,image_order