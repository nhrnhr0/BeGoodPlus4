# from django.db import models
# from product.models import Product
# from django.utils.translation import gettext_lazy  as _
# from django.conf import settings
# Create your models here.
# class ProductImage(models.Model):
#     class Meta():
#         verbose_name = _('Product image')
#         verbose_name_plural = _('Product images')
#         default_related_name = 'images'
    
#     image = models.ImageField(verbose_name=_('image'))
#     product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name=_('Product'))

#     @property
#     def get_absolute_image_url(self):
#         return '%s%s' % (MEDIA_URL, self.image.url)

