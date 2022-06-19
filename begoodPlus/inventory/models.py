from django.urls import reverse
from signal import default_int_handler
from django.conf import settings
from django.db import models
from provider.models import Provider
from catalogImages.models import CatalogImage, CatalogImageVarient
from django.db.models.signals import pre_save
from django.dispatch import receiver
from productSize.models import ProductSize
from django.utils.translation import gettext_lazy  as _
from color.models import Color
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete
from django.db.models.signals import m2m_changed
from django.db.models import Count
from django.utils.html import mark_safe

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
# Create your models here.

# PPN - ProviderProductName
# - product_id - FK Product
# - provider_id - FK Provider
# - providerProductName
# - fastProductTitle - text - autofill with product->title
# provider_id & providerProductName are unique together
class PPN(models.Model):
    product = models.ForeignKey(to=CatalogImage, on_delete=models.DO_NOTHING, verbose_name=_('product'))
    provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7, verbose_name=_('provider'))
    buy_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Buy Price (no tax)'))
    store_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name=_('Store Price (no tax)'), null=True, blank=True)
    providerProductName = models.CharField(max_length=100, verbose_name=_('provide\'s product name'),)
    providerMakat = models.CharField(max_length=100, verbose_name=_('provider\'s makat'), default='', blank=True, null=True)
    barcode = models.CharField(max_length=100, verbose_name=_('barcode'), blank=True, default='')
    has_phisical_barcode = models.BooleanField(default=False, verbose_name=_('has phisical barcode'))
    #fastProductTitle = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    #default_warehouse = models.ForeignKey(to='Warehouse', on_delete=models.SET_DEFAULT,null=True, blank=True, default=1, verbose_name=_('default warehouse'))
    class Meta:
        unique_together = ('provider', 'providerProductName','barcode','has_phisical_barcode','providerMakat')
    def __str__(self):
        return self.providerProductName
#@receiver(pre_save, sender=PPN)
#def set_PPN_product_title(sender, instance, *args, **kwargs):
#    instance.fastProductTitle = instance.product.title

class WarehouseStockHistory(models.Model):
    # from_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='warehouse_stock_history_from')
    # from_object_id = models.PositiveIntegerField()
    # from_content_object = GenericForeignKey('from_content_type', 'from_object_id')
    
    # to_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='warehouse_stock_history_to')
    # to_object_id = models.PositiveIntegerField()
    # to_content_object = GenericForeignKey('to_content_type', 'to_object_id')
    
    # from_new_quantity = models.IntegerField(default=0, verbose_name=_('from quantity'))
    # to_new_quantity = models.IntegerField(default=0, verbose_name=_('to quantity'))
    # created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    old_quantity = models.IntegerField(default=0, verbose_name=_('old quantity'))
    new_quantity = models.IntegerField(default=0, verbose_name=_('new quantity'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('created at'))
    note = models.TextField(verbose_name=_('note'), blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_('user'))
    class Meta:
        verbose_name = _('warehouse stock history')
        verbose_name_plural = _('warehouse stock history')
    def __str__(self):
        return str(self.from_content_object) + ' -> ' + str(self.to_content_object)

    def get_admin_url(self):
        return reverse('admin:%s_%s_change' % (self._meta.app_label, self._meta.model_name),
                    args=[self.id])

class WarehouseStock(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    warehouse = models.ForeignKey(to='Warehouse', on_delete=models.CASCADE)
    ppn = models.ForeignKey(to=PPN, on_delete=models.CASCADE)
    size = models.ForeignKey(to=ProductSize, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(to=Color, on_delete=models.SET_NULL, null=True, blank=True)
    verient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    avgPrice = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    history = models.ManyToManyField(to='WarehouseStockHistory', blank=True)
    class Meta():
        unique_together = ('warehouse','ppn', 'size', 'color', 'verient')
        ordering = ['-created_at']
    def __str__(self):
        verient = (' - ' + str(self.verient)) if (self.verient)  else ''
        size = (' - ' + str(self.size)) if (self.size and self.size.size != 'ONE SIZE')  else ''
        color = (' - ' + str(self.color)) if (self.color and self.color.name != 'no color')  else ''
        return str(self.warehouse) + ' | ' + str(self.ppn.product.title) + '(' + str(self.ppn) + ') ' + size + color + verient + ' => ' + str(self.quantity)
    def get_admin_url(self):
        return reverse('admin:%s_%s_change' % (self._meta.app_label, self._meta.model_name),
                args=[self.id])
    #buyHistory = models.ManyToManyField(to='ProductEnterItems', related_name='buyHistory', blank=True)
@receiver(post_save, sender=WarehouseStock, dispatch_uid='update_catalogImage_stock')
def update_catalogImage_stock(sender, instance, created, **kwargs):
    # get all warchouseStock objects with the same sku__ppn__product_id
    # get the qunatity of all these objects
    # update the catalogImage stock
    
    # sku = instance.sku
    # qty = WarehouseStock.objects.filter(sku__ppn__product=sku.ppn.product).aggregate(models.Sum('quantity'))['quantity__sum']
    # sku.ppn.product.qyt = qty
    # sku.ppn.product.save()
    pass
class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    #stock = models.ManyToManyField(to=WarehouseStock, blank=True, related_name='warehouse')
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
    docNumber = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    warehouse = models.ForeignKey(to=Warehouse, on_delete=models.SET_DEFAULT, default=1)
    items = models.ManyToManyField(to='ProductEnterItems', related_name='doc', blank=True)
    isAplied = models.BooleanField(default=False)
    byUser = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    new_products = models.JSONField(null=True, blank=True)
    '''def apply_doc(self):
        for item in self.items.all():
            sku = item.sku
            qyt = item.quantity
            price = item.price
            warehouse = self.warehouse
            warehouseStock = warehouse.stock.filter(sku=sku)
            if len(warehouseStock) == 0:
                warehouseStock = WarehouseStock.objects.create(sku=sku, quantity=qyt, avgPrice=price)
                warehouse.stock.add(warehouseStock)
            else:
                warehouseStock = warehouseStock[0]
                warehouseStock.avgPrice = (warehouseStock.avgPrice * warehouseStock.quantity + price * qyt) / (warehouseStock.quantity + qyt)
                warehouseStock.quantity += qyt
                #warehouseStock.save()
            warehouseStock.buyHistory.add(item)
            warehouseStock.save()
            warehouse.save()
        self.isAplied = True
        self.save()
    '''
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
    #sku = models.ForeignKey(to=SKUM, on_delete=models.SET_DEFAULT, default=1)
    ppn = models.ForeignKey(to=PPN, on_delete=models.CASCADE)
    entries = models.ManyToManyField(to='ProductEnterItemsEntries', blank=True, related_name='item')
    #total_quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    #barcode = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    total_quantity = property(lambda self: sum(self.entries.values_list('quantity', flat=True)))
    #warehouse = models.ForeignKey(to=Warehouse, on_delete=models.SET_DEFAULT, default=1)
    def __str__(self) -> str:
        return str(self.ppn.product.title) + ' | ' + str(self.ppn.provider.name) + ' | ' + str(self.total_quantity)
    #def __str__(self):
        #return str(self.sku.selfDisplay()) + ' | כמות: ' + str(self.quantity) + ' | ' + str(self.price) + '₪'
    class Meta:
        ordering = ('ppn__product__title',)
def remove_entries_if_orphan(tags_pk_set):
    """Removes tags in tags_pk_set if they're associated with only 1 File."""

    annotated_tags = ProductEnterItemsEntries.objects.annotate(n_files=Count('item'))
    unreferenced = annotated_tags.filter(pk__in=tags_pk_set).filter(n_files=1)
    unreferenced.delete()
# This will clean unassociated Tags when deleting/bulk-deleting File objects
@receiver(pre_delete, sender=ProductEnterItems)
def handle_file_deletion(sender, **kwargs):
    associated_tags = kwargs['instance'].entries.values_list('pk')
    remove_entries_if_orphan(associated_tags)

# This will clean unassociated Tags when clearing or removing Tags from a File
@receiver(m2m_changed, sender=ProductEnterItems.entries.through)
def handle_tags(sender, **kwargs):
    action = kwargs['action']
    if action == "pre_clear":
        tags_pk_set = kwargs['instance'].entries.values_list('pk')
    elif action == "pre_remove":
        tags_pk_set = kwargs.get('pk_set')
    else:
        return
    remove_entries_if_orphan(tags_pk_set)
# Warehouse - 
# name String
class ProductEnterItemsEntries(models.Model):
    size = models.ForeignKey(to=ProductSize, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(to=Color, on_delete=models.SET_NULL, null=True, blank=True)
    verient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        size= self.size.size if self.size else ''
        color = self.color.name if self.color else ''
        verient = self.verient.name if self.verient else ''
        return size + ' ' + color + ' ' + verient + ' | ' + str(self.quantity)