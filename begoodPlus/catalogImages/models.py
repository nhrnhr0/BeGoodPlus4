
from productColor.models import ProductColor
from django.db.models.signals import m2m_changed
from datetime import datetime
from email.policy import default
import decimal
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils.html import mark_safe
from django.conf import settings
from django.urls import reverse
import pytz
from begoodPlus.settings.base import CLOUDINARY_BASE_URL
#from catalogImageAttrs.models import ProductPrices
from django.utils.text import slugify

#from color.models import Color
from provider.models import Provider
from productSize.models import ProductSize
from packingType.models import PackingType
#from catalogImageDetail.models import CatalogImageDetail
import sys
from cloudinary.models import CloudinaryField
#from cloudinary.uploader import upload
import cloudinary
from pathlib import Path
from django.core.files.uploadedfile import InMemoryUploadedFile

from django.db.models.signals import post_save
from django.dispatch import receiver


class CatalogImageVarient(models.Model):
    name = models.CharField(
        max_length=255, verbose_name=_('Name'), unique=True)

    class Meta:
        ordering = ('id',)
        verbose_name = _('Product varient')
        verbose_name_plural = _('Product varients')

    def __str__(self):
        return self.name


# Create your models here.


class CatalogImage(models.Model):
    title = models.CharField(
        max_length=120, verbose_name=_("title"), unique=False)
    slug = models.SlugField(max_length=255, verbose_name=_(
        'Slug'), unique=True, null=True, blank=True, allow_unicode=True)
    description = models.TextField(verbose_name=_("description"))
    barcode = models.CharField(verbose_name=_(
        'barcode'), max_length=50, blank=True, null=True)
    has_physical_barcode = models.BooleanField(
        verbose_name=_('has physical barcode'), default=False)
    free_text = models.TextField(verbose_name=_(
        'free text'), null=True, blank=True)
    whatsapp_text = models.TextField(verbose_name=_(
        'whatsapp text'), blank=True, null=True)

    @property
    def has_free_text(self):
        return self.free_text != None and self.free_text != '' and self.free_text != ' '

    def desc(self):
        return self.description[0:30]
    desc.short_description = _('short description')
    update_image_to_cloudinary = models.BooleanField(default=True)
    # CloudinaryField('product_image', overwrite=True,resource_type="image",null=True, blank=True)
    cimage = models.CharField(verbose_name=_(
        'cloudinary image url'), null=True, blank=True, max_length=2047)
    image = models.ImageField(verbose_name=_("image"), null=True, blank=True)
    image_thumbnail = models.ImageField(
        verbose_name=_("local image"), null=True, blank=True)
    cost_price = models.FloatField(verbose_name=_(
        'cost price, before tax'), blank=False, null=False, default=1)
    client_price = models.FloatField(verbose_name=_(
        'store price, before tax'),  blank=False, null=False, default=1)
    recomended_price = models.FloatField(verbose_name=_(
        'private client price, after tax'),  blank=False, null=False, default=1)
    date_modified = models.DateTimeField(
        auto_now=True, verbose_name=_('date modified'))
    date_created = models.DateTimeField(
        auto_now_add=True, verbose_name=_('date created'))
    packingTypeProvider = models.ForeignKey(to=PackingType, related_name='PTprovider',
                                            on_delete=models.SET_DEFAULT, default=9, verbose_name=_('packing type from provider'))
    packingTypeClient = models.ForeignKey(to=PackingType, related_name='PTclient',
                                          on_delete=models.SET_DEFAULT, default=9, verbose_name=_('packing type for client'))
    amountSinglePack = models.IntegerField(verbose_name=_(
        'amount in single pack'), blank=False, null=False, default=0)
    amountCarton = models.IntegerField(verbose_name=_(
        'amount in carton'), blank=False, null=False, default=0)
    colors = models.ManyToManyField(to=ProductColor, verbose_name=_('colors'))
    sizes = models.ManyToManyField(to=ProductSize, verbose_name=_('sizes'))
    varients = models.ManyToManyField(
        to=CatalogImageVarient, verbose_name=_('varients'), blank=True)
    providers = models.ManyToManyField(
        to=Provider, verbose_name=_('providers'))
    qyt = models.IntegerField(verbose_name=_(
        'qyt'), blank=False, null=False, default=0)
    show_sizes_popup = models.BooleanField(
        verbose_name=_('show sizes popup'), default=True)
    out_of_stock = models.BooleanField(
        verbose_name=_('out of stock'), default=False)

    is_active = models.BooleanField(default=False, verbose_name=_('is active'))
    # detailTabel = models.ManyToManyField(
    #     related_name='parent', to=CatalogImageDetail, verbose_name=_('mini-tabel'), blank=True)

    can_tag = models.BooleanField(default=False, verbose_name=_('can tag'))
    #big_discount = models.BooleanField(default=False)

    # clientPrices = models.OneToOneField(
    #     to=ProductPrices, on_delete=models.SET_NULL, null=True, blank=True)

    NO_DISCOUNT = ''
    DISCOUNT_10_PRES = '/static/assets/catalog/imgs/discount_10.gif'
    DISCOUNT_20_PRES = '/static/assets/catalog/imgs/discount_20.gif'

    main_public_album = models.ForeignKey(
        to='catalogAlbum.CatalogAlbum', related_name='main_album', on_delete=models.SET_NULL, null=True, blank=True)

    DISCOUNT_TYPES = [
        (NO_DISCOUNT, 'ללא הנחה'),
        (DISCOUNT_10_PRES, '10% הנחה'),
        (DISCOUNT_20_PRES, '20% הנחה'),
    ]
    discount = models.CharField(
        max_length=50, choices=DISCOUNT_TYPES, default=NO_DISCOUNT, null=True, blank=True)

    def free_text_display(self):
        # div with truncating text and title with full text
        truncating_size = 7
        if self.free_text == None:
            return ''
        if len(self.free_text) > truncating_size:
            return mark_safe(f'<div title="{self.free_text}">{self.free_text[0:truncating_size]}..</div>')
        else:
            return mark_safe(self.free_text)
    free_text_display.short_description = 'טקסט חופשי'

    def is_main_public_album_set(self):
        return self.main_public_album != None
    is_main_public_album_set.boolean = True
    is_main_public_album_set.short_description = 'יש אלבום ראשי'

    def get_user_price(self, user_id):
        return 1
        # from campains.models import CampainProduct
        # if user_id == None:
        #     return decimal.Decimal(self.client_price).normalize()
        # catalogImage_id = self.id
        # # check if the product is in any campaign of the client
        # # campain = MonthCampain.objects.filter(users__user_id=user_id, products__id=catalogImage_id).first()
        # # israel
        # tz = pytz.timezone('Israel')

        # campainProduct = CampainProduct.objects.filter(monthCampain__users__user_id=user_id, catalogImage_id=catalogImage_id,
        #                                                monthCampain__is_shown=True, monthCampain__startTime__lte=datetime.now(tz), monthCampain__endTime__gte=datetime.now(tz)).first()
        # #campainProduct = campainProduct.first()
        # if campainProduct:
        #     return decimal.Decimal(campainProduct.newPrice).normalize()
        # else:
        #     from client.models import Client
        #     client = Client.objects.get(user_id=user_id)
        #     tariff = client.tariff
        #     price = self.client_price + (self.client_price * (tariff/100))
        #     price = round(price * 2) / \
        #         2 if price > 50 else "{:.2f}".format(price)
        #     return decimal.Decimal(price).normalize()

    def price_component(buy, sell):
        prcent = ((buy / sell) - 1)*100
        precent_clr = "green" if prcent > 0 else "red"
        # .format(buy, prcent))
        return mark_safe(f'<div style="direction: ltr;">{buy:.2f}₪ <span style="color:{precent_clr}">({prcent:.2f}%)</span></div>')

    def cost_price_dis(self):
        return mark_safe(f'<div style="font-weight: bold;">{self.cost_price}₪<div>')
    cost_price_dis.short_description = _('cost price (no VAT)')

    def client_price_dis(self):
        return CatalogImage.price_component(self.client_price, self.cost_price)
    client_price_dis.short_description = _('store price  (no VAT)')

    def recomended_price_dis(self):
        return CatalogImage.price_component(self.recomended_price, self.client_price)
    recomended_price_dis.short_description = _('private client price (no VAT)')

    def get_absolute_url(self):
        product_url = reverse('shareable_product_view', args=[self.id])
        return product_url

    def link_copy(self):
        url = self.get_absolute_url()
        return mark_safe(f'<a href="{url}" target="_blank">{url}</a>')
    link_copy.short_description = _('copy link')

    class Meta():
        verbose_name = _('Catalog image')
        verbose_name_plural = _('Catalog images')
        ordering = ('-date_created',)
        #ordering = ['throughimage__image_order']

    def get_cloundinary_url(self):
        if self.cimage and self.cimage != '':
            return CLOUDINARY_BASE_URL + self.cimage
        else:
            ''

    def get_small_cloundinary_url(self):
        if self.cimage and self.cimage != '':
            return CLOUDINARY_BASE_URL + 'w_25,h_25,c_scale,q_auto/' + self.cimage

    def optimize_image(image, size, *args, **kwargs):
        desired_size = 500
        im = Image.open(image)
        old_size = im.size  # old_size[0] is in (width, height) format

        ratio = float(desired_size)/max(old_size)
        new_size = tuple([int(x*ratio) for x in old_size])
        # use thumbnail() or resize() method to resize the input image

        # thumbnail is a in-place operation

        # im.thumbnail(new_size, Image.ANTIALIAS)

        im = im.resize(new_size, Image.ANTIALIAS)
        # create a new image and paste the resized on it

        new_im = Image.new("RGBA", (desired_size, desired_size))
        new_im.paste(im, ((desired_size-new_size[0])//2,
                          (desired_size-new_size[1])//2))

        output = BytesIO()
        new_im.save(output, format='PNG', quality=75)
        output.seek(0)
        return output

        '''
        im = Image.open(image)
        output = BytesIO()
        im = im.resize(size, Image.ANTIALIAS)
        im = im.convert('RGBA')
        im.save(output, format='PNG', quality=75)
        output.seek(0)
        return output 
        '''
    def optimize_tubmail(image, size, *args, **kwargs):
        im = Image.open(image)
        output = BytesIO()
        im.thumbnail(size)
        im = im.resize(size)
        im = im.convert('RGBA')
        im.save(output, format='PNG', quality=50)
        output.seek(0)
        return output

    def update_show_sizes_popup(self):
        if self.sizes.count() > 1:
            self.show_sizes_popup = True
        else:
            self.show_sizes_popup = False
        self.save()

    def recalculate_main_public_album(self):
        alb = self.albums.filter(is_public=True).first()
        if alb:
            self.main_public_album = alb
            self.save()

    def save(self, *args, **kwargs):
        if self.update_image_to_cloudinary:
            # fails if your don't upload an image, so don't upload image to cloudinary
            mfile = None
            try:
                output = CatalogImage.optimize_image(
                    self.image, size=(923, 715))
                mfile = InMemoryUploadedFile(output, 'ImageField', "%s.png" % self.image.name.split('.')[0], 'image/PNG',
                                             sys.getsizeof(output), None)
                if mfile:
                    res = cloudinary.uploader.upload(mfile,
                                                     folder="site/products/",
                                                     #public_id = fname,
                                                     unique_filename=False,
                                                     use_filename=True,
                                                     overwrite=True,
                                                     invalidate=True
                                                     )  # public_id = self.title + '_' + str(self.id))
                    self.cimage = 'v' + \
                        str(res['version']) + '/' + res['public_id']
                    self.image = None
            except Exception as e:
                print(e)
            finally:
                self.update_image_to_cloudinary = False

        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
            # check if slug is unique
            if CatalogImage.objects.filter(slug=self.slug).exists():
                if self.id:
                    self.slug = self.slug + '-' + str(self.id)
                else:
                    self.slug = self.slug + '-' + \
                        str(uuid.uuid4()).split('-')[1]

        super(CatalogImage, self).save(*args, **kwargs)

    def render_thumbnail(self, *args, **kwargs):
        ret = ''
        if self.cimage:
            ret += '<img width="50px" height="50px" src="%s" />' % (
                CLOUDINARY_BASE_URL + self.cimage)
        return mark_safe(ret)
    render_thumbnail.short_description = _("thumbnail")

    def render_image(self, *args, **kwargs):
        ret = ''
        if self.image:
            ret += '<img src="%s"/>' % (settings.MEDIA_URL + self.image.name)
        return mark_safe(ret)
    render_image.short_description = _("image")

    def __str__(self):
        return self.title


@receiver(post_save, sender=CatalogImage, dispatch_uid="recalculate_main_public_album")
def recalculate_main_public_album_post_save(sender, instance, **kwargs):
    if not instance.main_public_album:
        instance.recalculate_main_public_album()
    else:
        if instance.albums.all().count() == 0:
            instance.albums.add(instance.main_public_album)
            instance.save()


# m2m_changed.connect(
#     albums_changed, sender='catalogImages.CatalogImage.albums.through', dispatch_uid="albums_changed")
