from django.db import models

from product.models import Product
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class GlofaType(models.Model):
    class Meta:
        verbose_name = _('glofa type')
        verbose_name_plural = _('glofa types')
    num = models.PositiveIntegerField(verbose_name=_("number"));
    description = models.TextField(verbose_name=_("description"));
    supportedProducts = models.ManyToManyField(to=Product, verbose_name=_("supported products"), related_name='supportedProducts')
    
    def __str__(self):
        return str(self.num) + ') ' + self.description
        
        

class GlofaImage(models.Model):
    class Meta:
        verbose_name = _('glofa image')
        verbose_name_plural = _('glofa images')
    image = models.ImageField(verbose_name=_("image"), upload_to='GlofaImages')
    glofaLocation = models.ManyToManyField(to=GlofaType, through='GlofaImageTypeConnection')
    
    def __str__(self):
        return self.image.name
    
    

class GlofaImageTypeConnection(models.Model):
    glofaImage = models.ForeignKey(to=GlofaImage, on_delete=models.CASCADE)
    glofaType = models.ForeignKey(to=GlofaType, on_delete=models.CASCADE)
    cords = models.CharField(max_length=150, )
    RECT = 'rect'
    CIRCLE = 'circle'
    POLY = 'poly'
    SHAPES_CHOICES = [
        (RECT, RECT),
        (CIRCLE, CIRCLE),
        (POLY, POLY)
    ]
    shape = models.CharField(max_length=10, choices=SHAPES_CHOICES, default=RECT,)

