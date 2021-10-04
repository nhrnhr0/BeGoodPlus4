from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.utils.text import slugify
class Category(models.Model):
       
    #slug = models.SlugField(_(u'slug'), max_length=100, unique=True)
    title = models.CharField(_(u'title'), max_length=250)
    #parent = models.ForeignKey('self', blank=True, null=True, related_name='child', on_delete=models.CASCADE)
    itemsCount = models.IntegerField(default=0)
    catalog_rep = models.CharField(verbose_name=_('catalog representation'),max_length=1, blank=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['-title']
        
    def products_count(self):
        return self.product_set.count()
    products_count.short_description = _("products count")

    
    
    def __str__(self):
        return self.title + ' (' + self.catalog_rep + ')'