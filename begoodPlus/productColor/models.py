from django.db import models
from color.models import Color
from django.utils.translation import gettext_lazy  as _
from django.utils.html import mark_safe

#from product.models import Product
# Create your models here.
class ProductColor(Color):
    class Meta():
        verbose_name = _('product color')
        verbose_name_plural = _('product colors')
        ordering = ('code',)
        default_related_name = 'productColors'
        
    code = models.CharField(verbose_name=_('code'), max_length=2)
    
    def __str__(self):
        return self.name + '(' + self.code + ')'

    def colored_box(self):
        return mark_safe('<h5 style="background:{0};width:100%;height:100%;">{1} </h5>'.format(self.color, self.name))
    colored_box.short_description = _("color representation")