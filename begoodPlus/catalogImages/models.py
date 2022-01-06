from django.db import models
from django.utils.translation import gettext_lazy  as _
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils.html import mark_safe
from django.conf import settings
from django.urls import reverse

from color.models import Color
from provider.models import Provider
from productSize.models import ProductSize
from packingType.models import PackingType
from catalogImageDetail.models import CatalogImageDetail
import sys
from cloudinary.models import CloudinaryField
#from cloudinary.uploader import upload
import cloudinary
from pathlib import Path
from django.core.files.uploadedfile import InMemoryUploadedFile
# Create your models here.
class CatalogImage(models.Model):
    title = models.CharField(max_length=120, verbose_name=_("title"), unique=False)
    description = models.TextField(verbose_name=_("description"))
    barcode = models.CharField(verbose_name=_('barcode'),max_length=50, blank=True, null=True)
    free_text = models.TextField(verbose_name=_('free text'), null=True, blank=True)
    whatsapp_text = models.TextField(verbose_name=_('whatsapp text'), blank=True, null=True)
    def desc(self):
        return self.description[0:30]
    desc.short_description= _('short description')
    cimage = models.CharField(verbose_name=_('cloudinary image url'), null=True, blank=True, max_length=2047)#CloudinaryField('product_image', overwrite=True,resource_type="image",null=True, blank=True)
    image = models.ImageField(verbose_name=_("image"), null=True, blank=True)
    image_thumbnail = models.ImageField(verbose_name=_("local image"), null=True, blank=True)
    cost_price = models.FloatField(verbose_name=_('cost price'), blank=False, null=False, default=1)
    client_price = models.FloatField(verbose_name=_('store price'),  blank=False, null=False, default=1)
    recomended_price = models.FloatField(verbose_name=_('private client price'),  blank=False, null=False, default=1)
    date_modified = models.DateTimeField(auto_now=True)
    date_created = models.DateTimeField(auto_now_add=True)
    packingTypeProvider = models.ForeignKey(to=PackingType,related_name='PTprovider', on_delete=models.SET_DEFAULT, default=9, verbose_name=_('packing type from provider'))
    packingTypeClient = models.ForeignKey(to=PackingType,related_name='PTclient', on_delete=models.SET_DEFAULT, default=9, verbose_name=_('packing type for client'))
    colors = models.ManyToManyField(to=Color, verbose_name=_('colors'))
    sizes = models.ManyToManyField(to=ProductSize, verbose_name=_('sizes'))
    providers = models.ManyToManyField(to=Provider, verbose_name=_('providers'))
    
    detailTabel = models.ManyToManyField(related_name='parent',to=CatalogImageDetail, verbose_name=_('mini-tabel'), blank=True)

    can_tag = models.BooleanField(default=False, verbose_name=_('can tag'))
    #big_discount = models.BooleanField(default=False)
    
    NO_DISCOUNT = ''
    DISCOUNT_10_PRES = '/static/assets/catalog/imgs/discount_10.gif'
    DISCOUNT_20_PRES = '/static/assets/catalog/imgs/discount_20.gif'


    DISCOUNT_TYPES = [
        (NO_DISCOUNT, 'ללא הנחה'),
        (DISCOUNT_10_PRES, '10% הנחה'),
        (DISCOUNT_20_PRES, '20% הנחה'),
    ]
    discount = models.CharField(max_length=50, choices=DISCOUNT_TYPES, default=NO_DISCOUNT, null=True, blank=True)
    
    def price_component(buy, sell):
        prcent = ((buy / sell) - 1)*100
        precent_clr ="green" if prcent>0 else "red"
        return mark_safe(f'<div style="direction: ltr;">{buy:.2f}₪ <span style="color:{precent_clr}">({prcent:.2f}%)</span></div>');#.format(buy, prcent))
    

    def cost_price_dis(self):
        return mark_safe(f'<div style="font-weight: bold;">{self.cost_price}₪<div>')
    cost_price_dis.short_description= _('cost price (no VAT)')

    def client_price_dis(self):
        return CatalogImage.price_component(self.client_price, self.cost_price)
    client_price_dis.short_description= _('store price  (no VAT)')
    def recomended_price_dis(self):
        return CatalogImage.price_component(self.recomended_price, self.client_price)
    recomended_price_dis.short_description= _('private client price (no VAT)')


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
        #ordering = ['throughimage__image_order'] 
        
    
    def optimize_image(image,size, *args, **kwargs):
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
    
    def save(self, *args, **kwargs):
        
        if bool(self.image.name):
            # fails if your don't upload an image, so don't upload image to cloudinary
            mfile = None
            try:
                output = CatalogImage.optimize_image(self.image, size=(923, 715))
                mfile = InMemoryUploadedFile(output, 'ImageField', "%s.png" % self.image.name.split('.')[0], 'image/PNG',
                                            sys.getsizeof(output), None)
                
                output2 = CatalogImage.optimize_tubmail(self.image, size=(250,250))
                self.local_image = InMemoryUploadedFile(output2, 'ImageField', "image_thumbnail_%s.png" % self.image.name.split('.')[0], 'image/PNG',
                                           sys.getsizeof(output2), None)
                #super(CatalogImage, self).save(*args,**kwargs)
            except:
                pass
            try:
                #fname = Path(self.image.file.name).with_suffix('').name
                #fname = fname.substring(0, fname.lastIndexOf('.'))
                if mfile:
                    res = cloudinary.uploader.upload(mfile,
                        folder = "site/products/", 
                        #public_id = fname,
                        unique_filename = False,
                        use_filename = True,
                        overwrite=True,
                        invalidate=True
                        )#public_id = self.title + '_' + str(self.id))
                    self.cimage = 'v' + str(res['version']) +'/'+ res['public_id']
                    self.image = None
                pass
            except Exception as e:
                print(e)
            
            
        super(CatalogImage, self).save(*args,**kwargs)
        '''
            try:
                output = CatalogImage.optimize_image(self.image, size=(923, 715))
                self.image = InMemoryUploadedFile(output, 'ImageField', "%s.png" % self.image.name.split('.')[0], 'image/PNG',
                                            sys.getsizeof(output), None)
                output2 = CatalogImage.optimize_tubmail(self.image, size=(250,250))
                self.image_thumbnail = InMemoryUploadedFile(output2, 'ImageField', "image_thumbnail_%s.png" % self.image.name.split('.')[0], 'image/PNG',
                                            sys.getsizeof(output2), None)
            except:
                pass
            
        super(CatalogImage, self).save(*args,**kwargs)
        if not self.cimage:
            fname = Path(self.image.file.name).with_suffix('').name
            #fname = fname.substring(0, fname.lastIndexOf('.'))
            res = cloudinary.uploader.upload(self.image.file,
                folder = "site/products/", 
                public_id = fname
                )#public_id = self.title + '_' + str(self.id))
            self.cimage = 'v' + str(res['version']) +'/'+ res['public_id']
            self.save()
            pass
            '''
        # if the image is set and and squere image we will generate one
        '''
        im = Image.open(self.image)
        im2 = Image.open(self.image)
        output = BytesIO()
        output2 = BytesIO()

        # Resize/modify the image
        im = im.resize((923, 715))
        im2 = im2.resize((450, 450))
        im = im.convert('RGB')
        im2 = im2.convert('RGB')

        # after modifications, save it to the output
        im.save(output, format='JPEG', quality=75)
        im2.save(output2, format='JPEG', quality=75)
        output.seek(0)
        output2.seek(0)

        # change the imagefield value to be the newley modifed image value
        self.image = InMemoryUploadedFile(output, 'ImageField', "%s.jpg" % self.image.name.split('.')[0], 'image/jpeg',
                                        sys.getsizeof(output), None)
        self.image_thumbnail = InMemoryUploadedFile(output2, 'ImageField', "image_thumbnail_%s.jpg" % self.image.name.split('.')[0], 'image/jpeg',
                                        sys.getsizeof(output2), None)
        print(self.image, self.image.size)
        print(self.image_thumbnail, self.image_thumbnail.size)
        '''
        '''
        if self.image and not self.image_thumbnail:
            thub = Image.open(self.image)
            #thub.thumbnail(size)
            thub = thub.resize((450,450), Image.BILINEAR)
            f = BytesIO()
            try:
                thub.save(f, format='png')
                self.image_thumbnail.save('thunbnail_' + self.image.name,
                                                ContentFile(f.getvalue()))
            finally:
                f.close()
        '''
        
        
        

        
    def render_thumbnail(self, *args, **kwargs):
        ret = ''
        if self.cimage:
            ret += '<img width="50px" height="50px" src="%s" />' % ("https://res.cloudinary.com/ms-global/image/upload/" + self.cimage)
        return mark_safe(ret)
    render_thumbnail.short_description = _("thumbnail")
    
    def render_image(self, *args, **kwargs):
        ret = ''
        ret += '<img src="%s"/>' % (settings.MEDIA_URL + self.image.name) 
        return mark_safe(ret)
    render_image.short_description = _("image")
    
    def __str__(self):
        return self.title