from django.db import models
from django.urls.base import reverse
# Create your models here.
from django.utils.translation import gettext_lazy  as _
from begoodPlus.settings.base import CLOUDINARY_BASE_URL


from catalogImages.models import CatalogImage
from django.utils.html import mark_safe
from itertools import chain

'''
class CatalogAlbum(models.Model):
    title = models.CharField(max_length=120, verbose_name=_("title"))
    slug = models.SlugField(max_length=120, verbose_name=_("slug"))
    images = models.ManyToManyField(to=CatalogImage, related_name='images', blank=True, through='ThroughImage')# 
    
    parent = models.ForeignKey('self',blank=True, null=True ,related_name='children', on_delete=models.CASCADE)
    class Meta:
        unique_together = ('slug', 'parent',)   
        

    
    def __str__(self):                           
        full_path = [self.title]                  
        k = self.parent
        while k is not None:
            full_path.append(k.title)
            k = k.parent
        return ' -> '.join(full_path[::-1])
    #def __str__(self):
    #    return self.title
    
    def get_absolute_url(self, *args, **kwargs):
        from django.urls import reverse
        parent = self.parent
        full_slug = ''
        while parent != None:
            full_slug = parent.slug + '/' + full_slug
            parent = parent.parent
        full_slug = full_slug + '/' + self.slug
        return reverse('albumView', args=[full_slug])
    get_absolute_url.short_description = 'URL'

'''
from mptt.models import MPTTModel, TreeForeignKey
import datetime
from adminsortable.models import Sortable
from cloudinary.models import CloudinaryField
import datetime
from django.utils.text import slugify
class TopLevelCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    my_order = models.PositiveIntegerField(default=0, blank=True, null=True, db_index=True, unique=True)
    image = CloudinaryField('image', blank=True, null=True, public_id='topLevelCategory/' + datetime.datetime.now().strftime('%Y-%m-%d-%H_%M_%S_%f'), format='png')
    slug = models.SlugField(max_length=120, verbose_name=_("slug"), unique=True, blank=True, null=True, allow_unicode=True)
    get_image = property(lambda self: self.image.url[len('https://res.cloudinary.com/ms-global/image/upload/'):] if self.image else '' if self.albums.order_by('album_order').first() == None else self.albums.order_by('album_order').first().cimage)
    def __str__(self) -> str:
        return self.name
    class Meta:
        ordering = ('my_order',)
    def image_display(self):
        img = self.get_image
        return mark_safe('<img src="{}" width="50" height="50" />'.format(CLOUDINARY_BASE_URL + img))
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super(TopLevelCategory, self).save(*args, **kwargs)
    
class CatalogAlbum(MPTTModel):
    topLevelCategory = models.ForeignKey(to="TopLevelCategory", on_delete=models.SET_NULL, null=True, blank=True, related_name='albums')
    title = models.CharField(max_length=120, verbose_name=_("title"))
    slug = models.SlugField(max_length=120, verbose_name=_("slug"), unique=True, blank=True, null=True, allow_unicode=True)
    description= models.TextField(verbose_name=_('description'), default='', blank=True)
    fotter = models.TextField(verbose_name=_('fotter'), default='', blank=True)
    keywords = models.TextField(verbose_name=_('keyworks'), default='', blank=True)
    images = models.ManyToManyField(to=CatalogImage, related_name='albums', blank=True, through='ThroughImage', verbose_name=_('album list'))
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    is_public = models.BooleanField(verbose_name=_('is public'), default=True)
    is_campain = models.BooleanField(verbose_name=_('is campain'), default=False)
    cimage = models.CharField(max_length=500, verbose_name=_("cimage"), default='', blank=True)
    #campain = models.ForeignKey('MonthCampain', on_delete=models.CASCADE, null=True, blank=True, related_name='album')
    #renew_for = models.DurationField(null=True, blank=True, default=datetime.timedelta(days=3))
    #renew_after = models.DurationField(null=True, blank=True, default=datetime.timedelta(days=1))
    #timer = models.DateTimeField(null=True, blank=True)
    album_order = models.PositiveIntegerField(default=0, blank=True, null=True)
    def save(self, *args, **kwargs):
        if self.cimage == '' and self.id != None:
            img = self.images.order_by('throughimage__image_order').first()
            self.cimage = img.cimage
            
        if not self.slug or self.slug == '' or CatalogAlbum.objects.filter(slug=self.slug).count() > 1:
            self.slug = slugify(self.title, allow_unicode=True)
        super(CatalogAlbum, self).save(*args, **kwargs)
        
        
    def render_cimage_thumbnail(self, *args, **kwargs):
        ret = ''
        if self.cimage:
            ret += '<img width="50px" height="50px" src="%s" />' % ("https://res.cloudinary.com/ms-global/image/upload/" + self.cimage)
        return mark_safe(ret)
    render_cimage_thumbnail.short_description = _("thumbnail")
        
        
    @property
    def sorted_image_set(self):
        return self.images.order_by('throughimage__image_order')
    
    class MPTTMeta:
        order_insertion_by = ['title']
        
    class Meta(Sortable.Meta):
        unique_together = ('slug', 'parent',)
        ordering = ['album_order']
        #ordering = ['throughimage__image_order'] 
        #ordering = ('throughimage__image_order',)

    def get_absolute_url(self):
        category_url = reverse('shareable_category_view', args=[self.id])
        return category_url
    def link_copy(self):
        url = self.get_absolute_url()
        return mark_safe(f'<a href="{url}" target="_blank">{url}</a>')
    link_copy.short_description = _('copy link')
    def __str__(self):
        return self.title
    '''
    def get_absolute_url(self, *args, **kwargs):
        from django.urls import reverse
        parent = self.parent
        full_slug = ''
        while parent != None:
            full_slug = parent.slug + '/' + full_slug
            parent = parent.parent
        full_slug = full_slug  + self.slug
        if full_slug == '':
            return ''
        return full_slug #reverse('albumView', args=[full_slug])
    get_absolute_url.short_description = 'URL'
    
    def view_in_website_link(self, *args, **kwargs):
        ret = '<a href="%s"> צפייה באתר %s</a>' %(self.get_absolute_url(), self.title)
        return mark_safe(ret)
    view_in_website_link.short_description = _("view in website")
        #return ret
    '''

from adminsortable.fields import SortableForeignKey
from adminsortable.models import Sortable

class ThroughImage(Sortable):
    catalogImage = SortableForeignKey(CatalogImage, on_delete=models.CASCADE, verbose_name=_('catalog image'))
    catalogAlbum = models.ForeignKey(CatalogAlbum, on_delete=models.CASCADE, verbose_name=_('catalog album'))
    
    image_order = models.PositiveIntegerField(default=0, editable=False, db_index=True)
    class Meta(Sortable.Meta):
        ordering = ['image_order']

