from django.db import models
from django.utils.translation import gettext_lazy  as _
from django.utils.html import mark_safe
from django.conf import settings
# Create your models here.
from adminsortable.models import Sortable

class CatalogLogo(Sortable):
    title = models.CharField(verbose_name=_('name'),max_length=120)
    img = models.ImageField(verbose_name=_('image'), upload_to='logos/')

    image_order = models.PositiveIntegerField(default=0, editable=False, db_index=True)
    class Meta(Sortable.Meta):
        ordering = ['image_order']
        
        
    def render_image(self, *args, **kwargs):
        ret = ''
        ret += '<img height="100px" width="auto" src="%s"/>' % (settings.MEDIA_URL + self.img.name) 
        return mark_safe(ret)
    render_image.short_description = _("image")
    
    def __str__(self):
        return self.title