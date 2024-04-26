from django.db.models.signals import post_save
from itertools import chain

from adminsortable.fields import SortableForeignKey
from catalogImages.models import CatalogImage
from django.db import models
from django.db.models.signals import m2m_changed, pre_save
from django.dispatch import receiver
from django.urls.base import reverse
from django.utils.html import mark_safe
# Create your models here.
from django.utils.translation import gettext_lazy as _

from begoodPlus.settings.base import CLOUDINARY_BASE_URL

import datetime
import uuid

from adminsortable.models import Sortable
from cloudinary.models import CloudinaryField
from django.utils.text import slugify


class TopLevelCategory(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name=_(
        "name"))
    my_order = models.PositiveIntegerField(
        default=0, blank=True, null=True, db_index=True, unique=True, verbose_name=_('order'))
    image = CloudinaryField(_('image'), blank=True, null=True, public_id='topLevelCategory/' +
                            datetime.datetime.now().strftime('%Y-%m-%d-%H_%M_%S_%f'), format='png')
    slug = models.SlugField(max_length=120, verbose_name=_(
        "slug"), unique=True, blank=True, null=True, allow_unicode=True)
    # TODO: this get_image can be more efficient (save to db or something)
    # get_image = property(lambda self: self.image.url[len(CLOUDINARY_BASE_URL):] if self.image else '' if self.albums.order_by(
    #     'album_order').first() == None else self.albums.order_by('album_order').first().cimage)
    def get_image(self):
        if self.image:
            return self.image
        if self.albums.count() > 0:
            return self.albums.order_by('album_order').first().get_image()
        return None
    def get_image_url(self):
        img = self.get_image()
        return img.url if img else ''
    

    def __str__(self) -> str:
        return self.name

    class Meta:
        ordering = ('my_order',)
        verbose_name = _('top level category')
        verbose_name_plural = _('top level categories')

    def image_display(self):
        img = self.get_image().url
        return mark_safe('<img src="{}" width="50" height="50" />'.format(img))
    image_display.short_description = _('image')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super(TopLevelCategory, self).save(*args, **kwargs)


class CatalogAlbum(models.Model):
    image = CloudinaryField('תמונה', blank=True, null=True,folder='catalogAlbum')
    is_public = models.BooleanField(verbose_name=_('is public'), default=True)
    topLevelCategory = models.ForeignKey(
        to="TopLevelCategory", on_delete=models.SET_NULL, null=True, blank=True, related_name='albums', verbose_name=_('top level category'))
    title = models.CharField(max_length=120, verbose_name=_("title"))
    slug = models.SlugField(max_length=120, verbose_name=_(
        "slug"), unique=True, blank=True, null=True, allow_unicode=True)
    album_order = models.PositiveIntegerField(default=0, blank=True, null=True, verbose_name=_(
        'album order'))
    description = models.TextField(verbose_name=_(
        'description'), default='', blank=True)
    fotter = models.TextField(verbose_name=_('fotter'), default='', blank=True)
    keywords = models.TextField(verbose_name=_(
        'keyworks'), default='', blank=True)
    images = models.ManyToManyField(to=CatalogImage, related_name='albums',
                                    blank=True, through='ThroughImage', verbose_name=_('album list'))
    
    cimage = property(lambda self: self.get_image())
    # parent = TreeForeignKey('self', on_delete=models.CASCADE,
    #                         null=True, blank=True, related_name='children')
    
    # is_campain = models.BooleanField(
    #     verbose_name=_('is campain'), default=False)
    # show_on_main_page = models.BooleanField(
    #     verbose_name=_('show on main page'), default=False)
    # cimage = models.CharField(max_length=500, verbose_name=_(
    #     "cimage"), default='', blank=True)
    
    #campain = models.ForeignKey('MonthCampain', on_delete=models.CASCADE, null=True, blank=True, related_name='album')
    #renew_for = models.DurationField(null=True, blank=True, default=datetime.timedelta(days=3))
    #renew_after = models.DurationField(null=True, blank=True, default=datetime.timedelta(days=1))
    #timer = models.DateTimeField(null=True, blank=True)
    

    # def save(self, *args, **kwargs):
    #     if self.cimage == '' and self.id != None:
    #         img = self.images.order_by('throughimage__image_order').first()
    #         if img:
    #             self.cimage = img.cimage

    #     if not self.slug or self.slug == '' or CatalogAlbum.objects.filter(slug=self.slug).count() > 1:
    #         self.slug = slugify(self.title, allow_unicode=True)
    #         if CatalogAlbum.objects.filter(slug=self.slug).exists():
    #             if self.id:
    #                 self.slug = self.slug + '-' + str(self.id)
    #             else:
    #                 self.slug = self.slug + '-' + \
    #                     str(uuid.uuid4()).split('-')[1]
    #     super(CatalogAlbum, self).save(*args, **kwargs)
    def get_image(self):
        if self.image:
            return self.image
        if self.images.count() > 0:
            return self.images.first().image
        return None
    def get_image_url(self):
        img = self.get_image()
        return img.url if img else ''
    def render_cimage_thumbnail(self, *args, **kwargs):
        ret = ''
        img = self.get_image()
        if img:
            ret += '<img width="50px" height="50px" src="%s" />' % (
                img.url)
        return mark_safe(ret)
    render_cimage_thumbnail.short_description = _("thumbnail")

    @property
    def sorted_image_set(self):
        return self.images.order_by('throughimage__image_order')

    # class MPTTMeta:
    #     order_insertion_by = ['title']

    class Meta:
        #unique_together = ('slug', 'topLevelCategory')
        ordering = ['topLevelCategory__my_order', 'album_order']
        # translate CatalogAlbum
        verbose_name = _('catalog album')
        verbose_name_plural = _('catalog albums')
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


@receiver(pre_save, sender=CatalogAlbum)
def populate_slug(sender, instance, *args, **kwargs):
    if not instance.slug or instance.slug == '':
        instance.slug = slugify(instance.title, allow_unicode=True)
    if CatalogAlbum.objects.filter(slug=instance.slug).count() > (1 - (1 if instance.id == None else 0)):
        instance.slug = slugify(
            instance.title, allow_unicode=True) + '-' + str(uuid.uuid4())[:8]
    pass


class ThroughImage(Sortable):
    catalogImage = SortableForeignKey(
        CatalogImage, on_delete=models.CASCADE, verbose_name=_('catalog image'))
    catalogAlbum = models.ForeignKey(
        CatalogAlbum, on_delete=models.CASCADE, verbose_name=_('catalog album'))

    image_order = models.PositiveIntegerField(
        default=0, editable=True, db_index=True)

    class Meta(Sortable.Meta):
        ordering = ['image_order']
        verbose_name = _('extra category')
        verbose_name_plural = _('extra categories')


# ThroughImage post save


@receiver(post_save, sender=ThroughImage)
def check_main_public_album(sender, instance, *args, **kwargs):
    if instance.catalogImage.main_public_album == None:
        instance.catalogImage.main_public_album = instance.catalogAlbum
        instance.catalogImage.save()

    pass


@receiver(m2m_changed, sender=ThroughImage)
def albums_changed(sender, instance, action, reverse, model, pk_set, **kwargs):
    from catalogAlbum.models import CatalogAlbum
    if action == 'post_add':
        if not instance.main_public_album:
            for pk in pk_set:
                album = CatalogAlbum.objects.get(pk=pk)
                if album.is_public:
                    instance.main_public_album = album
                    instance.save()
                    break
    if action == 'post_remove':
        if instance.main_public_album and instance.main_public_album.pk in pk_set:
            instance.main_public_album = None
            instance.save()
            instance.recalculate_main_public_album()

# m2m_changed.connect(albums_changed, sender=CatalogAlbum.images.through)
