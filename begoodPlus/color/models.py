from django.db import models
from colorfield.fields import ColorField
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class Color(models.Model):

    class Meta:
        verbose_name = _('Color')
        verbose_name_plural = _('Colors')
    
    name = models.CharField(max_length=30, verbose_name=_('color name'), unique=True)
    color = ColorField(verbose_name=_('color'), default='#FF0000')

    

    def __str__(self):
        return self.name
    