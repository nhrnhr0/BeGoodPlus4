import pytz
import datetime
from core.tasks import send_providers_docx_to_telegram_task
from core.gspred import gspread_fetch_sheet_from_url
from core.utils import uuid2slug
from django.core.files.base import ContentFile
import io
import zipfile
from core.utils import generate_provider_docx, process_sheets_to_providers_docx
from core.utils import get_sheet_from_drive_url
from catalogImages.models import CatalogImage, CatalogImageVarient
from colorhash import ColorHash
#from customerCart.models import CustomerCart
from urllib import request
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.html import mark_safe
from django.conf import settings
import json
import uuid
from json2html import *
from django.core.files.storage import FileSystemStorage


from django.db.models.signals import post_save
from django.dispatch import receiver
from numpy import NaN
import pandas as pd
from rest_framework.authtoken.models import Token
from productColor.models import ProductColor

from productSize.models import ProductSize


fs = FileSystemStorage()


# generate auth token for every new saved user
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


# Create your models here.


# class BeseContactInformation(models.Model):
#     name = models.CharField(verbose_name=_(
#         'name'), max_length=50, null=True, blank=True)
#     phone = models.CharField(verbose_name=_(
#         "phone"), max_length=30, null=True, blank=True)
#     email = models.EmailField(verbose_name=_(
#         'email'), max_length=120, blank=True, null=True)
#     message = models.TextField(verbose_name=_(
#         'message'), max_length=1500, blank=True, null=True)
#     url = models.URLField(default='')
#     sumbited = models.BooleanField(default=False)
#     created_date = models.DateTimeField(
#         auto_now_add=True, blank=True, null=True)
#     formUUID = models.UUIDField(unique=True, default='')

#     def owner_display(self):
#         ret = ''
#         for i in self.owner.all():
#             ret += f'<div style="font-weight: bold;">{str(i.device)}</div>'
#         return mark_safe(ret)
#     owner_display.short_description = _('owner')

#     class Meta:
#         pass
#         # unique_together = ('name', 'phone','email','url','sumbited')

#     def __str__(self):
#         url = self.url or 'None'
#         name = self.name or 'None'
#         phone = self.phone or 'None'
#         email = self.email or 'None'
#         return url + ' | ' + name + ' | ' + phone + ' | ' + email


# class Customer(models.Model):
#     contact = models.ManyToManyField(
#         to=BeseContactInformation, related_name='owner')
#     carts = models.ManyToManyField(to=CustomerCart, related_name='owner')
#     device = models.CharField(max_length=120, unique=True)

#     def get_active_cart(self):
#         active_cart, created = self.carts.get_or_create(
#             sumbited=False, defaults={'formUUID': uuid.uuid4(), })
#         return active_cart


class UserSearchData(models.Model):
    session = models.CharField(max_length=50)
    term = models.CharField(max_length=50)
    resultCount = models.IntegerField(verbose_name=_('number of results'))
    created_date = models.DateTimeField(
        auto_now_add=True, blank=True, null=True)
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')


# class SvelteContactFormModal(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL,
#                              on_delete=models.SET_NULL, null=True, blank=True)
#     device = models.CharField(verbose_name=_('device'), max_length=250)
#     uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
#     name = models.CharField(verbose_name=_('name'), max_length=120)
#     phone = models.CharField(verbose_name=_('phone'), max_length=120)
#     email = models.EmailField(verbose_name=_('email'), max_length=120)
#     message = models.TextField(verbose_name=_('message'))
#     created_date = models.DateTimeField(
#         auto_now_add=True, blank=True, null=True)

#     def uniqe_color(self):
#         ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
#         return mark_safe(ret)

# through model for many to many relationship between SvelteCartModal and CatalogImage including amount


# class SvelteCartProductEntery(models.Model):
#     product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
#     amount = models.IntegerField(verbose_name=_('amount'), default=1)
#     details = models.JSONField(verbose_name=_(
#         'details'), blank=True, null=True)
#     # cart = models.ForeignKey(to='SvelteCartModal', on_delete=models.CASCADE, null=True, blank=True)
#     unitPrice = models.DecimalField(verbose_name=_(
#         'unit price'), max_digits=10, decimal_places=2, default=0)
#     print = models.BooleanField(verbose_name=_('print'), default=False)
#     embro = models.BooleanField(verbose_name=_('embro'), default=False)

#     def __str__(self):
#         return str(self.amount) + ' - ' + self.product.title

#     class Meta:
#         pass
#         # unique_together = ('cart', 'product')


# class UserProductPhoto(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL,
#                              on_delete=models.SET_NULL, null=True, blank=True)
#     photo = models.ImageField(
#         upload_to='user_product_photos/', blank=True, null=True)
#     buy_price = models.DecimalField(verbose_name=_(
#         'buy price'), max_digits=10, decimal_places=2, default=0)
#     want_price = models.DecimalField(verbose_name=_(
#         'want price'), max_digits=10, decimal_places=2, default=0)
#     description = models.TextField(verbose_name=_(
#         'description'), max_length=1500, blank=True, null=True)
#     created_date = models.DateTimeField(
#         auto_now_add=True, blank=True, null=True)

#     def __str__(self):
#         return self.description

#     class Meta:
#         pass

#     def photo_display(self):
#         ret = ''
#         if self.photo:
#             ret = f'<img src="{self.photo.url}" width="100px" height="100px" />'
#         return mark_safe(ret)


class ActiveCartTracker(models.Model):
    data = models.JSONField(verbose_name=_('data'), blank=True, null=True)
    last_updated = models.DateTimeField(
        auto_now=True, blank=True, null=True, verbose_name=_('last updated'))
    created_at = models.DateTimeField(
        auto_now_add=True, blank=True, null=True, verbose_name=_('created at'))
    last_ip = models.CharField(verbose_name=_(
        'last ip'), max_length=120, blank=True, null=True)
    active_cart_id = models.CharField(verbose_name=_(
        'active cart id'), max_length=120, unique=True)

    def cart_products_size(self):
        if self.data:
            return len(self.data.keys())
        else:
            return 0
    cart_products_size.short_description = _('cart products size')

    def cart_products_html_table(self):
        print(self.data)
        html = ''
        if self.data:
            html = json2html.convert(json=self.data)
        return mark_safe(html)

    def products_amount_display_with_sizes_and_colors(self):
        all_sizes = ProductSize.objects.all().values('id', 'size', 'code')
        all_colors = ProductColor.objects.all().values('id', 'name')
        all_varients = CatalogImageVarient.objects.all().values('id', 'name')

        def get_varient_name(varient_id):
            for i in all_varients:
                if i['id'] == int(varient_id):
                    return i['name']

        def get_size_name(size_id):
            for i in all_sizes:
                if i['id'] == int(size_id):
                    return i['size']

        def get_color_name(color_id):
            color_id = int(color_id)
            for i in all_colors:
                if i['id'] == int(color_id):
                    return i['name']

        def get_size_code(size_id):
            for i in all_sizes:
                if i['id'] == int(size_id):
                    return i['code']
        data = self.data
        data.pop('active_cart_id', None)
        ret_data = []
        if len(data.keys()) == 0:
            return ''
        for product_id in data.keys():
            # example data:
            # {"5": {"id": 5, "embro": false, "print": false, "sizes": [98, 99, 100, 101, 102, 103], "title": "\u05e4\u05e0\u05d3\u05d4 \u05de\u05d5\u05e0\u05d1\u05d9\u05e1\u05d5", "albums": [5], "amount": 5, "cimage": "v1635672267/site/products/%D7%A4%D7%A0%D7%93%D7%94_%D7%9E%D7%95%D7%A0%D7%A1%D7%99%D7%91%D7%95_6nOpUNm_qYDCukF_NPmcgGo_WGqneJr_fD2vSpt_3x0EezN_LQgb69Q_2cOLJC7_Gn42nNk.png", "colors": [84], "barcode": null, "can_tag": false, "discount": null, "mentries": {"84": {"98": {"1": {}, "2": {"quantity": 5}, "3": {}}, "99": {"1": {}, "2": {}, "3": {}}, "100": {"1": {}, "2": {}, "3": {}}, "101": {"1": {}, "2": {}, "3": {}}, "102": {"1": {}, "2": {}, "3": {}}, "103": {"1": {}, "2": {}, "3": {}}}}, "varients": [{"id": 1, "name": "S2"}, {"id": 2, "name": "02"}, {"id": 3, "name": "S3"}], "description": "* \u05d4\u05d7\u05d1\u05e8\u05d4 \u05d4\u05d0\u05d9\u05d8\u05dc\u05e7\u05d9\u05ea \u05d7\u05d5\u05d6\u05e8\u05ea \u05dc\u05d9\u05e9\u05e8\u05d0\u05dc \u05e2\u05dd \u05d3\u05d2\u05dd \u05d4\u05d3\u05d2\u05dc\r\n* \u05e0\u05e2\u05dc \u05d0\u05d9\u05db\u05d5\u05ea\u05d9\u05ea \u05de\u05d0\u05d5\u05d3 \u05d1\u05e8\u05de\u05d4 \u05d4\u05d2\u05d1\u05d5\u05d4\u05d4 \u05d1\u05d9\u05d5\u05ea\u05e8\r\n* \u05e2\u05de\u05d9\u05d3\u05d5\u05ea \u05d1\u05ea\u05e0\u05d0\u05d9 \u05e9\u05d8\u05d7 \u05e7\u05e9\u05d9\u05dd \u05d1\u05de\u05d9\u05d5\u05d7\u05d3\r\n* \u05e2\u05d5\u05e8 \u05de\u05dc\u05d0 \u05e0\u05d2\u05d3 \u05de\u05d9\u05dd \u05e9\u05de\u05df \u05d5\u05db\u05d9\u05de\u05d9\u05e7\u05dc\u05d9\u05dd\r\n* \u05d1\u05d3\u05d9\u05dd \u05e4\u05e0\u05d9\u05de\u05d9\u05d9\u05dd \u05d0\u05e0\u05d8\u05d9\u05d1\u05d0\u05e7\u05d8\u05e8\u05d9\u05dc\u05d9\u05dd\r\n* \u05ea\u05e7\u05df \u05d0\u05d9\u05e8\u05d5\u05e4\u05d0\u05d9 \u05d5\u05d9\u05e9\u05e8\u05d0\u05dc\u05d9\r\n* 02/S3\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05de\u05d9\u05d2\u05d5\u05df \u05d0\u05d5 \u05dc\u05dc\u05d0 \u05de\u05d9\u05d2\u05d5\u05df", "amountCarton": 0, "client_price": 350, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": true, "has_physical_barcode": false}, "8": {"id": 8, "embro": false, "print": false, "sizes": [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105], "title": "\u05de\u05d2\u05e3 \u05d0\u05d9\u05d2\u05dc", "albums": [5], "amount": 1, "cimage": "v1635672269/site/products/%D7%9E%D7%92%D7%A3_%D7%90%D7%99%D7%92%D7%9C_DMqWwOX_Mkw9lcY_BvEiz4P_Cjtf4wS_sK7Cy0d_sgRVKb3.png", "colors": [77], "barcode": "\"676525115910\"", "can_tag": false, "discount": null, "mentries": {"77": {"95": {}, "96": {}, "97": {}, "98": {}, "99": {}, "100": {"quantity": 1}, "101": {}, "102": {}, "103": {}, "104": {}, "105": {}}}, "varients": [], "description": "* \u05e2\u05d5\u05e8 \u05de\u05e2\u05d5\u05d1\u05d3 \u05d0\u05d9\u05db\u05d5\u05ea\u05d9 \u05d5\u05d9\u05d9\u05e6\u05d5\u05d2\u05d9\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05de\u05d5\u05ea \u05d4\u05d2\u05e0\u05d4 \u05e9\u05d5\u05e0\u05d5\u05ea\r\n* 02 -- \u05e0\u05e2\u05dc \u05e7\u05dc\u05d4 \u05e2\u05dd \u05ea\u05e4\u05e8\u05d9\u05dd \u05de\u05d7\u05d5\u05d6\u05e7\u05d9\u05dd \u05de\u05ea\u05d0\u05d9\u05de\u05d4 \u05dc\u05db\u05dc \u05e1\u05d5\u05d2\u05d9 \u05d4\u05e2\u05d1\u05d5\u05d3\u05d5\u05ea \r\n* S3 \u2013 \u05db\u05d9\u05e4\u05ea \u05de\u05d2\u05df \u05de\u05d1\u05e8\u05d6\u05dc, \u05e9\u05db\u05d1\u05ea \u05e0\u05d9\u05e8\u05d5\u05e1\u05d8\u05d4 \u05dc\u05d0\u05d5\u05e8\u05da \u05d4\u05e1\u05d5\u05dc\u05d9\u05d4", "amountCarton": 0, "client_price": 90, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": true, "has_physical_barcode": false}, "18": {"id": 18, "embro": false, "print": false, "sizes": [94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 112], "title": "\u05de\u05d2\u05e3 \u05e8\u05d9\u05d9\u05e0\u05d5 \u05d7\u05d5\u05dd", "albums": [5], "amount": 4, "cimage": "v1635672275/site/products/%D7%9E%D7%92%D7%A3_%D7%A8%D7%99%D7%99%D7%A0%D7%95_%D7%97%D7%95%D7%9D_eCSr7G0_8xLp0Sv_NWbnc2R_UzWhTqA_cvMtXDa.png", "colors": [84], "barcode": "\"676525113701\"", "can_tag": false, "discount": null, "mentries": {"84": {"94": {}, "95": {}, "96": {}, "97": {}, "98": {}, "99": {"quantity": 4}, "100": {}, "101": {}, "102": {}, "103": {}, "104": {}, "105": {}, "112": {}}}, "varients": [], "description": "* \u05de\u05d2\u05e3 \u05e2\u05d1\u05d5\u05d3\u05d4 \u05e0\u05d5\u05d7 \u05d5\u05d9\u05d9\u05e6\u05d5\u05d2\u05d9\r\n* \u05e2\u05e9\u05d5\u05d9 \u05e2\u05d5\u05e8 \u05e0\u05d0\u05e4\u05d4 \u05e9\u05d7\u05d5\u05e8 \u05d5\u05d0\u05d9\u05db\u05d5\u05ea\u05d9\r\n* \u05e1\u05d5\u05dc\u05d9\u05d4 \u05d0\u05e0\u05d8\u05d9 \u05e1\u05d8\u05d8\u05d9\u05ea-\u05e2\u05e9\u05d5\u05d9\u05d4 \u05e9\u05d9\u05dc\u05d5\u05d1 \u05e9\u05dc \u05d2\u05d5\u05de\u05d9 \u05d5PU \u05d5\u05e2\u05de\u05d9\u05d3\u05d4 \u05d1\u05e9\u05d7\u05d9\u05e7\u05d4\r\n* \u05de\u05e6\u05d5\u05d9\u05d3 \u05d1\u05e8\u05e4\u05d9\u05d3\u05ea PU \u05d0\u05d9\u05db\u05d5\u05ea\u05d9\u05ea \u05d5\u05d1\u05d5\u05dc\u05de\u05ea \u05d6\u05e2\u05d6\u05d5\u05e2\u05d9\u05dd", "amountCarton": 0, "client_price": 140, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": true, "has_physical_barcode": false}, "20": {"id": 20, "embro": false, "print": false, "sizes": [87, 88, 89, 90, 91, 92, 93, 107], "title": "\u05d3\u05d2\u05de\"\u05d7 \u05d0\u05d9\u05e0\u05d3\u05d0\u05e0\u05d9", "albums": [13], "amount": 24, "cimage": "v1635672276/site/products/%D7%93%D7%92%D7%9E%D7%97_%D7%90%D7%99%D7%A0%D7%93%D7%90%D7%A0%D7%99_IyWQaK6_Tj5EYOe_P9uUDPV_t64qw8e_xJY95O3.png", "colors": [80, 82, 77, 91], "barcode": "\"676525031272\"", "can_tag": false, "discount": "/static/assets/catalog/imgs/discount_10.gif", "mentries": {"77": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "80": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "82": {"87": {}, "88": {}, "89": {}, "90": {"quantity": 24}, "91": {}, "92": {}, "93": {}, "107": {}}, "91": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}}, "varients": [], "description": "* \u05d4\u05de\u05db\u05e0\u05e1 \u05d4\u05d0\u05d4\u05d5\u05d1 \u05d1\u05d9\u05d5\u05ea\u05e8 \u05d1\u05e7\u05e8\u05d1 \u05d4\u05e2\u05d5\u05d1\u05d3\u05d9\u05dd \u05d1\u05d9\u05e9\u05e8\u05d0\u05dc\r\n* 100% \u05db\u05d5\u05ea\u05e0\u05d4\r\n* 6 \u05db\u05d9\u05e1\u05d9\u05dd\r\n* \u05ea\u05e4\u05d9\u05e8\u05d4 \u05de\u05d7\u05d5\u05d6\u05e7\u05ea \u05d1\u05e0\u05e7\u05d5\u05d3\u05d5\u05ea \u05d4\u05d7\u05e9\u05d5\u05d1\u05d5\u05ea\r\n* \u05d7\u05e6\u05d9 \u05d2\u05d5\u05de\u05d9 \u05de\u05d0\u05d7\u05d5\u05e8\u05d4\r\n* \u05de\u05ea\u05d0\u05d9\u05dd \u05dc\u05d7\u05d1\u05e8\u05d5\u05ea,\u05de\u05e4\u05e2\u05dc\u05d9\u05dd, \u05ea\u05e2\u05e9\u05d9\u05d4 \u05d5\u05e2\u05d5\u05d3...\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 33, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": true, "has_physical_barcode": false}, "27": {"id": 27, "embro": false, "print": false, "sizes": [87, 88, 89, 90, 91, 92, 93, 107], "title": "\u05d7\u05d5\u05dc\u05e6\u05ea \u05d8\u05e8\u05d9\u05e7\u05d5 140 \u05d2\u05e8\u05dd \u05e9\u05e8\u05d5\u05d5\u05dc \u05e7\u05e6\u05e8", "albums": [4], "amount": 28, "cimage": "v1635672280/site/products/%D7%97%D7%95%D7%9C%D7%A6%D7%AA_%D7%98%D7%A8%D7%99%D7%A7%D7%95_%D7%A9_eCcfOKX_YbTKIuD_Z2vtVmt_1IIPpTh.png", "colors": [77, 78, 80, 81, 88, 86], "barcode": null, "can_tag": false, "discount": null, "mentries": {"77": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "78": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "80": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "81": {"87": {}, "88": {"quantity": 28}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "86": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}, "88": {"87": {}, "88": {}, "89": {}, "90": {}, "91": {}, "92": {}, "93": {}, "107": {}}}, "varients": [], "description": "* \u05d7\u05d5\u05dc\u05e6\u05ea \u05d8\u05e8\u05d9\u05e7\u05d5\r\n* 100% \u05db\u05d5\u05ea\u05e0\u05d4\r\n* 140 \u05d2\u05e8\u05dd\r\n* \u05de\u05d2\u05d5\u05d5\u05df \u05e8\u05d7\u05d1 \u05e9\u05dc \u05e6\u05d1\u05e2\u05d9\u05dd\r\n* \u05d0\u05d5\u05e4\u05e6\u05d9\u05d4 \u05dc\u05db\u05d9\u05e1\r\n* \u05de\u05ea\u05d0\u05d9\u05dd \u05dc\u05de\u05d5\u05e1\u05d3\u05d5\u05ea \u05e2\u05dd \u05e2\u05d5\u05d1\u05d3\u05d9\u05dd \u05de\u05ea\u05d7\u05dc\u05e4\u05d9\u05dd\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 10, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": true, "has_physical_barcode": false}, "79": {"id": 79, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05de\u05e6\u05d7\u05d9\u05d4", "albums": [14], "amount": 6, "cimage": "v1635672294/site/products/%C3%AF%C3%A0%C3%BC%C3%86_%C3%84%C3%BB%C3%A7%C3%AB%C3%A4_khvuTHW_2J9tgA7_5vZ7ziD_e9beJnY.png", "colors": [77, 78, 80, 82, 83], "barcode": "\"676525090170\"", "can_tag": false, "discount": null, "mentries": {"77": {"108": {}}, "78": {"108": {}}, "80": {"108": {}}, "82": {"108": {}}, "83": {"108": {}}}, "varients": [], "description": "* \u05db\u05d5\u05d1\u05e2 \u05de\u05e6\u05d7\u05d9\u05d4 6 \u05e4\u05d0\u05e0\u05dc\r\n* \u05db\u05d5\u05d1\u05e2 \u05d9\u05e4\u05d4 \u05d5\u05d9\u05d9\u05e6\u05d5\u05d2\u05d9\r\n* \u05e0\u05e2\u05d9\u05dd \u05d5\u05e0\u05d5\u05d7\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05d4\u05e7\u05d8\u05e0\u05d4 \u05d0\u05d5 \u05d4\u05d2\u05d3\u05dc\u05d4 \u05e9\u05dc \u05d4\u05db\u05d5\u05d1\u05e2\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 8, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "80": {"id": 80, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05d3\u05e8\u05d9\u05d9\u05e4\u05d9\u05d8", "albums": [14], "amount": 6, "cimage": "v1635672294/site/products/%C3%AF%C3%A0%C3%BC%C3%86_%C3%A2%C3%BF%C3%AB%C3%AB%C3%B6%C3%AB%C3%AA_Hcq2pLW_mJEibrw_Pyo76Zx_Eo1aVfh.png", "colors": [77, 78, 80, 81, 82, 83, 86], "barcode": "\"676525088047\"", "can_tag": false, "discount": null, "mentries": {"77": {"108": {}}, "78": {"108": {}}, "80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}, "83": {"108": {}}, "86": {"108": {}}}, "varients": [], "description": "* \u05db\u05d5\u05d1\u05e2 \u05de\u05e6\u05d7\u05d9\u05d4 \u05de\u05e0\u05d3\u05e3 \u05d6\u05d9\u05e2\u05d4\r\n* \u05e0\u05d9\u05ea\u05df \u05dc\u05d4\u05d2\u05d3\u05dc\u05d4 \u05d0\u05d5 \u05d4\u05e7\u05d8\u05e0\u05d4 \r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05d4\u05d3\u05e4\u05e1\u05d4 \u05d0\u05d5 \u05e8\u05e7\u05de\u05d4", "amountCarton": 0, "client_price": 8, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "81": {"id": 81, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05dc\u05d9\u05d2\u05d9\u05d5\u05e0\u05e8", "albums": [14], "amount": 6, "cimage": "v1635672295/site/products/%D7%9B%D7%95%D7%91%D7%A2_%D7%9C%D7%99%D7%92%D7%99%D7%95%D7%A0%D7%A8_SwoWn3l_YbHh0LI_MQgPKSL_dykZppZ.png", "colors": [80, 81, 82, 88], "barcode": "\"676525078215\"", "can_tag": false, "discount": null, "mentries": {"80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}, "88": {"108": {}}}, "varients": [], "description": "* \u05de\u05db\u05e1\u05d4 \u05d0\u05ea \u05db\u05dc \u05d0\u05d6\u05d5\u05e8 \u05d4\u05e4\u05e0\u05d9\u05dd \u05d5\u05d4\u05e2\u05d5\u05e8\u05e3\r\n* \u05de\u05ea\u05d0\u05d9\u05dd \u05dc\u05e2\u05d5\u05d1\u05d3\u05d9 \u05e9\u05d8\u05d7\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 13, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "82": {"id": 82, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05dc\u05d9\u05d2\u05d9\u05d5\u05e0\u05e8 \u05d3\u05e8\u05d9\u05d9\u05e4\u05d9\u05d8", "albums": [14], "amount": 6, "cimage": "v1635672295/site/products/%C3%AF%C3%A0%C3%BC%C3%86_%C3%AE%C3%AB%C3%A9%C3%AB%C3%A0%C3%89%C3%BF_%C3%A2%C3%BF%C3%AB%C3%AB%C3%AB%C3%B6%C3%AA_IC2MoO1_owiDti9_tBSUol7_aGbQ0KZ.png", "colors": [80, 81, 82], "barcode": null, "can_tag": false, "discount": null, "mentries": {"80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}}, "varients": [], "description": "* \u05de\u05d2\u05df \u05e2\u05dc \u05d0\u05d6\u05d5\u05e8 \u05d4\u05e4\u05e0\u05d9\u05dd \u05d5\u05d4\u05e2\u05d5\u05e8\u05e3\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05d4\u05d9\u05d3\u05d5\u05e7 \u05d4\u05db\u05d5\u05d1\u05e2\r\n* \u05de\u05ea\u05d0\u05d9\u05dd \u05dc\u05e2\u05d5\u05d1\u05d3\u05d9 \u05e9\u05d8\u05d7\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05d4\u05d3\u05e4\u05e1\u05d4 \u05d0\u05d5 \u05e8\u05e7\u05de\u05d4", "amountCarton": 0, "client_price": 14, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "83": {"id": 83, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05d3\u05d9\u05d9\u05d2\u05d9\u05dd", "albums": [14], "amount": 6, "cimage": "v1635672296/site/products/%C3%AF%C3%A0%C3%BC%C3%86_%C3%AA%C3%84%C3%BC%C3%AE_gqpzVGQ_icYwIxW_gjcuysn_XfjGghv_tn5nOHp_aj8MpGZ_XwDzAGk_exVWH8u.png", "colors": [80, 81, 82, 78], "barcode": null, "can_tag": false, "discount": null, "mentries": {"78": {"108": {}}, "80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}}, "varients": [], "description": "* \u05d4\u05db\u05d5\u05d1\u05e2 \u05d4\u05db\u05d9 \u05d9\u05e9\u05e8\u05d0\u05dc\u05d9 \u05e9\u05d9\u05e9\r\n* \u05d0\u05d9\u05db\u05d5\u05ea\u05d9 \u05e0\u05d5\u05d7 \u05d5\u05e0\u05e2\u05d9\u05dd\r\n* \u05de\u05db\u05e1\u05d4 \u05d4\u05d9\u05d8\u05d1 \u05d0\u05ea \u05d4\u05e8\u05d0\u05e9\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 9, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "84": {"id": 84, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05d0\u05d5\u05e1\u05d8\u05e8\u05dc\u05d9", "albums": [14], "amount": 6, "cimage": "v1635672296/site/products/%D7%9B%D7%95%D7%91%D7%A2_%D7%A7%D7%90%D7%95%D7%91%D7%95%D7%99_NSM7mWU_ViNoYH2_3hIPIwp_ybOgoDU.png", "colors": [80, 81, 82], "barcode": "\"676525094789\"", "can_tag": false, "discount": null, "mentries": {"80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}}, "varients": [], "description": "* \u05db\u05d5\u05d1\u05e2 \u05e0\u05d4\u05d3\u05e8 \u05d4\u05de\u05db\u05e1\u05d4 \u05de\u05e2\u05d5\u05dc\u05d4 \u05d0\u05ea \u05db\u05dc \u05d7\u05dc\u05e7\u05d9 \u05d4\u05e8\u05d0\u05e9\r\n* \u05e0\u05d9\u05ea\u05df \u05dc\u05db\u05d5\u05d5\u05e5 \u05d5\u05dc\u05d4\u05d2\u05d3\u05d9\u05dc \u05e2\u05dc \u05d4\u05e8\u05d0\u05e9\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 15, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "85": {"id": 85, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05d0\u05d5\u05e1\u05d8\u05e8\u05dc\u05d9 \u05dc\u05d9\u05d2\u05d9\u05d5\u05e0\u05e8", "albums": [14], "amount": 6, "cimage": "v1635672297/site/products/%D7%9B%D7%95%D7%91%D7%A2_%D7%A7%D7%90%D7%95%D7%91%D7%95%D7%99_%D7%9C%D7%99%D7%92%D7%99%D7%95%D7%A0%D7%A8-removebg-preview_7EWlMSZ.png", "colors": [80, 81, 82], "barcode": null, "can_tag": false, "discount": null, "mentries": {"80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}}, "varients": [], "description": "* \u05de\u05e1\u05d2\u05e8\u05ea \u05d2\u05d3\u05d5\u05dc\u05d4 \u05d4\u05de\u05db\u05e1\u05d4 \u05d0\u05ea \u05db\u05dc \u05d7\u05dc\u05e7\u05d9 \u05d4\u05e8\u05d0\u05e9\r\n* \u05d1\u05e2\u05dc \u05d1\u05d3 \u05d0\u05d7\u05d5\u05e8\u05d9 \u05d4\u05de\u05d2\u05df \u05e2\u05dc \u05d4\u05e2\u05d5\u05e8\u05e3 \r\n* \u05e0\u05d9\u05ea\u05df \u05dc\u05db\u05d5\u05d5\u05e5 \u05d5\u05dc\u05d4\u05d2\u05d3\u05d9\u05dc \u05e2\u05dc \u05d4\u05e8\u05d0\u05e9\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05e8\u05e7\u05de\u05d4 \u05d0\u05d5 \u05d4\u05d3\u05e4\u05e1\u05d4", "amountCarton": 0, "client_price": 20, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "86": {"id": 86, "embro": false, "print": false, "sizes": [108], "title": "\u05db\u05d5\u05d1\u05e2 \u05e1\u05d4\u05e8\u05d4", "albums": [14], "amount": 6, "cimage": "v1635672297/site/products/%D7%9B%D7%95%D7%91%D7%A2_%D7%A1%D7%94%D7%A8%D7%94_8zzC3A7_v8CeX92_4lSti1E.png", "colors": [80, 81, 82, 88], "barcode": "\"676525071322\"", "can_tag": false, "discount": null, "mentries": {"80": {"108": {}}, "81": {"108": {}}, "82": {"108": {}}, "88": {"108": {}}}, "varients": [], "description": "* \u05db\u05d5\u05d1\u05e2 \u05d0\u05d9\u05db\u05d5\u05ea\u05d9 \u05d5\u05e0\u05d5\u05d7\r\n* \u05de\u05d2\u05df \u05e2\u05dc \u05db\u05dc \u05d7\u05dc\u05e7\u05d9 \u05d4\u05e4\u05e0\u05d9\u05dd, \u05d4\u05e2\u05d5\u05e8\u05e3, \u05d5\u05d4\u05e6\u05d5\u05d5\u05d0\u05e8\r\n* \u05e4\u05ea\u05d7\u05d9 \u05d0\u05d5\u05d5\u05d9\u05e8 \u05d1\u05e6\u05d9\u05d3\u05d9 \u05d4\u05e8\u05d0\u05e9\r\n* \u05e9\u05e8\u05d5\u05da \u05dc\u05d4\u05e7\u05d8\u05e0\u05d4 \u05d5\u05d4\u05d2\u05d3\u05dc\u05d4\r\n* \u05de\u05ea\u05d0\u05d9\u05dd \u05d1\u05de\u05d9\u05d5\u05d7\u05d3 \u05dc\u05e2\u05d5\u05d1\u05d3\u05d9\u05dd \u05d4\u05e0\u05de\u05e6\u05d0\u05d9\u05dd \u05d4\u05e8\u05d1\u05d4 \u05e9\u05e2\u05d5\u05ea \u05d1\u05e9\u05de\u05e9\r\n* \u05d0\u05e4\u05e9\u05e8\u05d5\u05ea \u05dc\u05d4\u05d3\u05e4\u05e1\u05d4 \u05d0\u05d5 \u05e8\u05e7\u05de\u05d4", "amountCarton": 0, "client_price": 19, "out_of_stock": false, "amountSinglePack": 0, "show_sizes_popup": false, "has_physical_barcode": false}, "active_cart_id": "a4ece0a1859349f2964629f07496f104"}
            mentries = data.get(product_id, None).get('mentries', {})
            amount = data.get(product_id, None).get('amount', None)
            product_with_amount = str(
                amount) + ' => ' + data.get(product_id, None).get('title', '')
            for color_id in mentries.keys():
                for size_id in mentries[color_id].keys():
                    if len(mentries[color_id][size_id].keys()) > 1:
                        for verient_id in mentries[color_id][size_id].keys():
                            quantity = mentries[color_id][size_id][verient_id].get(
                                'quantity', None)
                            ret_data.append({
                                'size_code': get_size_code(size_id),
                                'מוצר': product_with_amount,
                                'צבע': get_color_name(color_id),
                                'גודל': get_size_name(size_id),
                                'מודל': get_varient_name(verient_id),
                                'qty': quantity,
                            })
                    # if have key quantity:
                    quantity = mentries[color_id][size_id].get(
                        'quantity', None)
                    ret_data.append({
                        'size_code': get_size_code(size_id),
                        'מוצר': product_with_amount,
                        'צבע': get_color_name(color_id),
                        'גודל': get_size_name(size_id),
                        'מודל': '',
                        'qty': quantity,
                    })
        df = pd.DataFrame(ret_data)
        piv = df.pivot(index=['מוצר', 'צבע', 'מודל'],
                       columns=['גודל'], values=['qty'])
        # piv = piv.sort_index(axis='columns', level='size_code')
        piv = piv.dropna(axis='columns', how='all')
        piv = piv.fillna('')
        html = piv.to_html(
            index=True, classes='table table-striped table-bordered table-hover', na_rep='')
        return mark_safe(html)


# class SvelteCartModal(models.Model):
#     doneOrder = models.BooleanField(
#         default=False, verbose_name=_('done order'))
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
#                              null=True, blank=True, related_name='user_cart', verbose_name=_('user'))
#     device = models.CharField(verbose_name=_('device'), max_length=250)
#     uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True)
#     name = models.CharField(verbose_name=_('name'), max_length=120)
#     businessName = models.CharField(verbose_name=_(
#         'business name'), max_length=120, null=True, blank=True)
#     phone = models.CharField(verbose_name=_('phone'), max_length=120)
#     email = models.EmailField(verbose_name=_('email'), max_length=120)
#     products = models.ManyToManyField(to=CatalogImage, blank=True)
#     productEntries = models.ManyToManyField(
#         to=SvelteCartProductEntery, blank=True)
#     productsRaw = models.TextField(verbose_name=_(
#         'raw products'), blank=True, null=True)
#     message = models.TextField(verbose_name=_(
#         'message'), blank=True, null=True)
#     created_date = models.DateTimeField(
#         auto_now_add=True, blank=True, null=True, verbose_name=_('created date'))
#     agent = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
#                               null=True, blank=True, related_name='agent', verbose_name=_('agent'))
#     order_type = models.CharField(verbose_name=_(
#         'order type'), max_length=120, null=True, blank=True)
#     # order_type = models.CharField(max_length=120, choices=[('Invoice', 'חשבונית מס'), ('RefundInvoice', 'חשבונית זיכוי'), (
#     #     'PriceProposal', 'הצעת מחיר'), ('ShippingCertificate', 'תעודת משלוח'), ('ReturnCertificate', 'תעודת החזרה')], blank=True, null=True)

#     def cart_count(self):
#         return self.productEntries.count()
#     cart_count.short_description = _('cart count')

#     def products_amount_display(self):
#         ret = '<ul>'
#         for i in self.productEntries.all():
#             ret += f'<li><div style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</div></li>'
#         ret += '</ul>'
#         return mark_safe(ret)

#     def products_amount_display_with_sizes_and_colors(self):
#         ret = '<table>'
#         all_sizes = ProductSize.objects.all().values('id', 'size')
#         all_colors = ProductColor.objects.all().values('id', 'name')
#         all_varients = CatalogImageVarient.objects.all().values('id', 'name')

#         def get_varient_name(varient_id):
#             for i in all_varients:
#                 if i['id'] == int(varient_id):
#                     return i['name']

#         def get_size_name(size_id):
#             for i in all_sizes:
#                 if i['id'] == int(size_id):
#                     return i['size']

#         def get_color_name(color_id):
#             color_id = int(color_id)
#             for i in all_colors:
#                 if i['id'] == int(color_id):
#                     return i['name']

#         for i in self.productEntries.all():
#             ret += f'<tr><td style="font-weight: bold;">{str(i.amount)} - {str(i.product)}</td>'
#             if i.details != None:
#                 details = i.details
#                 # detail_table = '<td><table>'
#                 # i.details = [{"size_id": 90, "color_id": "77", "quantity": 12}, {"size_id": 90, "color_id": "78", "quantity": 35}, {"size_id": 89, "color_id": "79", "quantity": 6}, {"size_id": 88, "color_id": "83", "quantity": 19}, {"size_id": 89, "color_id": "83", "quantity": 7}]
#                 tableData = []

#                 for color_id in details.keys():
#                     for size_id in details[color_id].keys():
#                         size = get_size_name(size_id)
#                         color = get_color_name(color_id)

#                         if 'quantity' in details[color_id][size_id].keys():

#                             tableData.append(
#                                 {'size': size, 'color': color, 'varient': '', 'qyt': details[color_id][size_id]['quantity']})
#                         else:
#                             for varient_id in details[color_id][size_id].keys():
#                                 varient = get_varient_name(varient_id)
#                                 qyt = details[color_id][size_id][varient_id].get(
#                                     'quantity', None)
#                                 if qyt != None and qyt != 0:
#                                     tableData.append(
#                                         {'size': size, 'color': color, 'varient': varient, 'qyt': qyt})

#                     # detail_table += f'<tr><td>{size.size}</td><td>{color.name}</td><td>{str(qyt)}</td></tr>'
#                 # detail_table += '</table></td><hr>'
#                 # ret += detail_table
#                 if (len(tableData) > 0):
#                     df = pd.DataFrame(tableData)
#                     # remove from df rows with qyt == '-' or qyt == 0 or qyt == Nan or qyt == None
#                     # df = df[df['qyt'].str.contains('-') == True or df['qyt'].str.contains('0') == True or df['qyt'].str.contains('NaN') == True or df['qyt'].str.contains('None') == True]
#                     try:
#                         df = df.pivot(
#                             index=['color', 'varient'], columns='size', values='qyt')
#                     except Exception as e:
#                         print(e)
#                     ret += '<td>' + \
#                         df.to_html(index=True, header=True,
#                                    table_id='table_id', na_rep='-') + '</td>'
#             if i.print:
#                 ret += f'<td>הדפסה</td>'
#             if i.embro:
#                 ret += f'<td>רקמה</td>'
#             if i.unitPrice:
#                 ret += f'<td>{i.unitPrice} ש"ח ליח</td>'
#             # ret += '<td id="cart-entry-'+str(i.id)+'">'  + '<input type="hidden" name="product_id" value="' + str(i.product.id) + '">' + '<input type="hidden" name="cart_id" value="' + str(self.id) + '">' + '<input type="hidden" name="entry_id" value="' + str(i.id) + '"><button type="button" onclick="remove_product_from_cart(' + str(self.id) + ',' +str(i.id)+')">' + 'מחק' + '</button>' + '</td>'
#             ret += '</tr>'
#         ret += '</table>'
#         return mark_safe(ret)

#     def uniqe_color(self):
#         ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{self.device}</span>'
#         return mark_safe(ret)
#     uniqe_color.short_description = _('uniqe color')

#     def turn_to_morder(self):
#         from docsSignature.utils import create_signature_doc_from_morder
#         from morders.models import MOrder, MOrderItem, MOrderItemEntry, MorderStatus
#         cart = self
#         if self.user and self.user.is_authenticated:
#             client = self.user.client
#             name = self.name if self.name != '' else self.user.client.businessName
#             phone = self.phone if self.phone != '' else self.user.client.contactManPhone
#             email = self.email if self.email != '' else self.user.client.email
#         else:
#             client = None
#             name = self.name
#             phone = self.phone
#             email = self.email
#         message = self.message if self.message != '' else ''
#         agent = self.agent if self.agent != '' else ''
#         # STATUS_CHOICES = [('new', 'חדש'), ('price_proposal', 'הצעת מחיר'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט',), (
#         #     'in_progress3', 'בהדפסה',), ('in_progress4', 'מוכן בבית דפוס'), ('in_progress5', 'ארוז מוכן למשלוח'), ('done', 'סופק'), ]
#         status = 'price_proposal' if self.order_type == 'הצעת מחיר' else 'new'
#         try:
#             st = 'הצעת מחיר' if self.order_type == 'הצעת מחיר' else 'חדש'
#             status2 = MorderStatus.objects.get(name=st)
#         except:
#             status2 = None
#             pass
#         products = self.productEntries.all()
#         products_list = []
#         for i in products:
#             product = i.product
#             quantity = i.amount
#             details = i.details
#             # example details:
#             # {'84': {'94': {'quantity': 0}, '95': {'quantity': 0}, '96': {'quantity': 0}, '97': {'quantity': 0}, '98': {'quantity': 0}, '99': {'quantity': 0}, '100': {'quantity': 0}, '101': {'quantity': 0}, '102': {'quantity': 0}, 'quantity': 0}}
#             # {'COLOR_ID': {'SIZE_ID': {'VARIANT_ID': {'quantity': 0}...}...}}
#             # or
#             # {'COLOR_ID': {'SIZE_ID': {'quantity': 0}...}...}
#             price = i.unitPrice
#             currentProduct = {'product': product, 'price': price}
#             entries_list = []
#             if details == None or len(details) == 0:
#                 size_id = None
#                 color_id = None
#                 varient_id = None
#                 entries_list.append(
#                     {'size_id': size_id, 'color_id': color_id, 'varient_id': varient_id, 'quantity': quantity})
#             else:
#                 for color_id in details.keys():
#                     for size_id in details[color_id].keys():
#                         if 'quantity' in details[color_id][size_id].keys():
#                             quantity = details[color_id][size_id].get(
#                                 'quantity', None)

#                             # products_list.append({'product': product,'price':price, 'quantity': quantity, 'color_id': color_id, 'size_id': size_id, 'varient_id': None})
#                             if quantity != None and quantity != 0:
#                                 entries_list.append(
#                                     {'size_id': size_id, 'color_id': color_id, 'varient_id': None, 'quantity': quantity})

#                         else:
#                             for varient_id in details[color_id][size_id].keys():
#                                 quantity = details[color_id][size_id][varient_id].get(
#                                     'quantity', None)
#                                 # products_list.append({'product': product,'price':price, 'quantity': quantity, 'color_id': color_id, 'size_id': size_id, 'varient_id': varient_id})
#                                 if quantity != None and quantity != 0:
#                                     entries_list.append(
#                                         {'size_id': size_id, 'color_id': color_id, 'varient_id': varient_id, 'quantity': quantity})
#             if (len(entries_list) > 0):
#                 currentProduct['entries'] = entries_list
#             else:
#                 ONE_SIZE_ID = 108
#                 NO_COLOR_ID = 76
#                 currentProduct['entries'] = [
#                     {'size_id': ONE_SIZE_ID, 'color_id': NO_COLOR_ID, 'varient_id': None, 'quantity': i.amount}]
#             products_list.append(currentProduct)
#         # order_product = [MOrderItem(product=i['product'], price=i['price']) for i in products_list]
#         # MOrderItem.objects.bulk_create(order_product)
#         dbProducts = []
#         for product in products_list:
#             dbEntries = [MOrderItemEntry(size_id=entry['size_id'], color_id=entry['color_id'],
#                                          varient_id=entry['varient_id'], quantity=entry['quantity']) for entry in product['entries']]
#             dbEntries = MOrderItemEntry.objects.bulk_create(dbEntries)

#             dbProduct = MOrderItem.objects.create(
#                 product=product['product'], price=product['price'])
#             dbProduct.entries.set(dbEntries)
#             dbProducts.append(dbProduct)
#         morder = MOrder.objects.create(cart=cart, client=client, name=name,
#                                        phone=phone, email=email, status=status, status2=status2, message=message, agent=agent)
#         morder.products.add(*dbProducts)
#         morder.recalculate_total_price()
#         morder.save()

#         # Create Signature for created morder
#         create_signature_doc_from_morder(morder)

#         sync_price_prop = True
#         sync_order = True
#         if morder.status2.name == 'הצעת מחיר' or morder.status2.name == 'הצעת מחיר נשלחה':
#             sync_order = False
#         # if סופק / בוטל and there is no morder.gid then sync_order = False
#         if (morder.status2.name == 'סופק' or morder.status2.name == 'בוטל') and morder.gid == None:
#             sync_order = False

#         morder.start_morder_to_spreedsheet_thread(sync_price_prop, sync_order)
#         morder.notify_order_status_update()
#         return morder

#     def __str__(self):
#         # Return a string that represents the instance
#         return f"{self.created_date.strftime('%Y-%m-%d %H:%M:%S')} - {self.name} - {self.cart_count()}"


# ProvidersDocxTaskStatusChoices = (
#     ('new', _('New')),
#     ('in_progress', _('In Progress')),
#     ('done', _('Done')),
#     ('error', _('Error')),
# )


# class ProvidersDocxTask(models.Model):
#     links = models.JSONField(blank=True, null=True)
#     created_date = models.DateTimeField(auto_now_add=True)
#     updated_date = models.DateTimeField(auto_now=True)
#     logs = models.JSONField(blank=True, null=True)
#     docx = models.FileField(
#         upload_to='docx', blank=True, null=True, storage=fs)
#     status = models.CharField(
#         max_length=20, choices=ProvidersDocxTaskStatusChoices, default='new')
#     progress = models.IntegerField(default=0)
#     doc_names = models.JSONField(blank=True, null=True)

#     def status_str_display(self):
#         ret = dict(ProvidersDocxTaskStatusChoices)[self.status]
#         return ret

#     def process_sheetsurl_to_providers_docx(self):
#         # try:
#         sheets = []
#         urls = self.links
#         self.status = 'in_progress'
#         self.logs = []
#         self.save()
#         loaded_files = {}
#         self.doc_names = []
#         last_sh = None
#         for url in urls:
#             log = 'fetching sheet from url: ' + url
#             self.logs.append(log)
#             self.save()

#             try:
#                 sheet, sheetname, last_sh = gspread_fetch_sheet_from_url(
#                     url, last_sh)
#             except Exception as e:
#                 log = 'error: ' + str(e) + ' - ' + url
#                 self.logs.append(log)
#                 self.save()
#                 continue

#             sheets.append(sheet)
#             self.doc_names.append(sheetname)
#             log = 'downloaded'
#             self.logs.append(log)
#             self.save()

#         self.logs.append('parsing sheets')
#         info = process_sheets_to_providers_docx(sheets, self)
#         self.save()
#         # print(info)
#         # get all sheet names
#         # get each sheet get row[1] col[0] as the sheetname
#         # morders_ids = []
#         # for sheet in sheets:
#         #     print(sheet.columns)
#         #     print(sheet.iloc[0, 0])
#         #     morders_ids.append(str(int(float(sheet.iloc[0, 0]))))
#         docs_data = []
#         with_private_file = [False, True]
#         for is_file_private in with_private_file:
#             for provider_name in info.keys():
#                 doc, seccsess = generate_provider_docx(
#                     info[provider_name], provider_name, is_file_private)
#                 # if doc is string then there was an error
#                 if type(doc) == str:
#                     return {'error': {
#                         'provider_name': provider_name,
#                         'product_name': doc
#                     }}
#                 # docs.append(doc)
#                 if seccsess:
#                     prov_name = provider_name
#                     if is_file_private:
#                         prov_name = 'private_' + prov_name
#                     docs_data.append({
#                         'doc': doc,
#                         'provider_name': prov_name,
#                         'morders_ids': info[provider_name].get('morders', ''),
#                         'is_private': is_file_private,
#                     })

#         zip_buffer = io.BytesIO()
#         with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
#             for doc_info in docs_data:
#                 file_stream = io.BytesIO()
#                 doc = doc_info['doc']
#                 doc.save(file_stream)
#                 if doc_info['is_private']:
#                     file_name = str(
#                         '(' + doc_info['provider_name'] + ') ' + '|'.join(doc_info['morders_ids']) + '.docx')
#                 else:
#                     file_name = str(doc_info['provider_name'] + ' ' +
#                                     str(datetime.datetime.now(tz=pytz.timezone(
#                                         'Israel')).strftime("%Y-%m-%d")) + '.docx')
#                 file_stream.seek(0)
#                 zip_file.writestr(
#                     file_name, file_stream.getvalue())
#         zip_buffer.seek(0)
#         self.status = 'done'
#         self.docx = ContentFile(zip_buffer.getvalue(
#         ), 'providers - ' + str(self.created_date) + '.zip')
#         self.save()

#         # send providers file to telegram
#         send_providers_docx_to_telegram(self.docx.path)

#         return {'zip': zip_buffer}
#         # except Exception as e:
#         #     print(e)
#         #     self.status = 'error'
#         #     self.logs.append(str(e))
#         #     self.save()
#         #     return {'error': str(e)}


# def send_providers_docx_to_telegram(docx_path):
#     # send providers file to telegram
#     try:
#         if settings.DEBUG:
#             send_providers_docx_to_telegram_task(docx_path)
#         else:
#             send_providers_docx_to_telegram_task.delay(docx_path)
#     except Exception as e:
#         print(e)
