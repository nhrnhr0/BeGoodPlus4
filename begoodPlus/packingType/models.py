from django.db import models
from django.utils.translation import gettext_lazy  as _

# Create your models here.
class PackingType(models.Model):
    class Meta:
        verbose_name = _('Packing type')
        verbose_name_plural = _('Packing types')
        
        
    name = models.CharField(verbose_name='packing type', max_length=50)

    def __str__(self):
        return self.name
    