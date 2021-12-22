from django.db import models
from category.models import Category
from django.utils.translation import gettext_lazy  as _
from productColor.models import ProductColor
from provider.models import Provider
from packingType.models import PackingType
from utils.utils import get_next_value
from django.utils.html import mark_safe
from django.conf import settings
from utils import utils
from catalogImages.models import CatalogImage
        
        
class Product(models.Model):
    
    class Meta():
        verbose_name = _('Product')
        verbose_name_plural = _('Products')
        ordering = ('category',)
        
    name = models.CharField(max_length=120, verbose_name=_('name'))
    category = models.ForeignKey(Category, on_delete=models.PROTECT, verbose_name=_('category'))
    #running_code = models.IntegerField(verbose_name='sub-catalog')
    category_index = models.IntegerField()
    

    #packing = models.ForeignKey(to=PackingType, on_delete=models.CASCADE, default=0)
    suport_printing = models.BooleanField(verbose_name=_('suport printing'), default=True)
    suport_embroidery = models.BooleanField(verbose_name=_('suport embroidery'), default=True) 
    content = models.TextField(verbose_name=_('content'), blank=True, default='')
    comments = models.TextField(verbose_name=_('comments'),blank=True, default='')
    
    barcode = models.CharField(max_length=30)
    catalog_images = models.ManyToManyField(to=CatalogImage)
    
    #customer_catalog = models.CharField(verbose_name=_("customer catalog"), max_length=50)
    def __str__(self):
        return self.name
        
    
        
    

    def catalog_part(self, *args, **kwargs):
        return ''.join(utils.catalog_representation[self.category_index])

    def customer_catalog_gen(self, *args, **kwargs):
        ret = self.category.catalog_rep + 'z' + self.catalog_part() + '-' + str(self.id)
        return ret
    customer_catalog_gen.short_description = _("customer catalog number")


    def save(self, commit=True, *args, **kwargs):
        if self.category_index == None:
            self.category_index = self.category.itemsCount + 1
            Category.objects.filter(pk=self.category.pk).update(itemsCount=self.category_index)
            
        #super(Product, self).save(*args, **kwargs)
        self.customer_catalog = self.customer_catalog_gen(args,kwargs) # use product's id
        super(Product, self).save(*args, **kwargs)
        pass
        
    
    #def sing_client_range(self, *args, **kwargs):
    #    return '(' + str(self.const_sing_client_min) + ' - ' +  str(self.const_sing_client_max) + ')'
    #sing_client_range.short_description = _("single client price range")
    
    def total_amount(self, *args, **kwargs):
        return self.stocks_totalamount
        
        #from stock.models import Stock
        #from django.db.models import Sum
        
        #stocks = Stock.objects.filter(product=self)
        #stocks = self.stocks
        #res = stocks.aggregate(Sum('amount'))
        #return res['amount__sum']
    total_amount.short_description = _("total stock at us")
    


#    def render_image(self, *args, **kwargs):
        #images = self.images.only('image')
        #length = len(images)
#        ret = ''
        #for i in range(length):
        #    ret += '<img src="%s" width="150" height="150" />' % images[i].image.url#(settings.MEDIA_URL + image.image.name) 
#        return mark_safe(ret)
#    render_image.short_description = _("image")

    def render_image(self, *args, **kwargs):
        from productImages.models import ProductImage
        #images = ProductImage.objects.filter(product=self)
        images = self.images.all()
        ret = ''
        for image in images:
            ret += '<img src="%s" width="150" height="150" />' % (settings.MEDIA_URL + image.image.name) 
        return mark_safe(ret)
    render_image.short_description = _("image")