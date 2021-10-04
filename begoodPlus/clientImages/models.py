from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.conf import settings
# Create your models here.
class ClientImage(models.Model):
    class Meta():
        verbose_name = _('Client image')
        verbose_name_plural = _('Client images')
        #default_related_name = 'images'
    
    image = models.ImageField(verbose_name=_('image'), )
    

    @property
    def get_absolute_image_url(self):
        
        return '%s%s' % (settings.MEDIA_URL, self.image.url)