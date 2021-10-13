from django.db import models
from django.utils.translation import gettext_lazy  as _
from colorfield.fields import ColorField
# Create your models here.
class Provider(models.Model):

    class Meta():
        verbose_name = _('Provider')
        verbose_name_plural = _('Providers')
        default_related_name = 'providers'

    name = models.CharField(max_length=150, verbose_name=_('name'))
    providerId = models.CharField(max_length=150, verbose_name=_('private compeny'), blank=True)
    code = models.CharField(verbose_name=_('code'), max_length=3, default='A')
    #color = models.ForeignKey(Color, on_delete=models.CASCADE)
    #color = ColorField(verbose_name=_('color'))

    def __str__(self):
        return self.name + ' (' + self.code + ')'
        
    
