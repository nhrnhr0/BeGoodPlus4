from openpyxl.styles import Alignment
import copy
from oauth2client.service_account import ServiceAccountCredentials
import gspread
from ordered_model.models import OrderedModelBase
from begoodPlus.secrects import GOOGLE_SERVICE_ACCOUNT_FILE, SECRECT_CLIENT_SIDE_DOMAIN, ALL_MORDER_FILE_SPREEDSHEET_URL
from django.conf import settings
import reversion
from decimal import Decimal
import secrets
from django.forms import ValidationError
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from multiprocessing.connection import Client
import pandas as pd
from django.db import models
from django.contrib.auth.models import User
from core.utils import number_to_spreedsheet_letter
from morders.tasks import send_morder_status_update_to_telegram
from catalogImages.models import CatalogImage
from client.models import Client
from color.models import Color
from core.models import SvelteCartModal
from inventory.models import ProviderRequest, WarehouseStock
from productSize.models import ProductSize
from catalogImages.models import CatalogImageVarient
from provider.models import Provider
from django.utils.html import mark_safe
import datetime
from django.db.models import Count, F, Value
from django.db.models import OuterRef, Subquery
from django.db.models import Q
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Sum, Avg, When, Case
from django.db.models.functions import Substr
from django.db.models.functions import Concat
from django.db.models.functions import Length
from begoodPlus.secrects import SMARTBEE_DOMAIN, SMARTBEE_providerUserToken
from smartbee.models import SmartbeeResults, SmartbeeTokens
import requests
from django.db.models.signals import pre_save, post_save, m2m_changed
from django.dispatch import receiver


class CollectedInventory(models.Model):
    warehouseStock = models.ForeignKey(
        WarehouseStock, on_delete=models.CASCADE, related_name='collectedInventory')
    quantity = models.IntegerField(default=0)


class TakenInventory(models.Model):
    quantity = models.IntegerField(default=0)
    color = models.ForeignKey(
        to=Color, on_delete=models.SET_DEFAULT, default=76,)
    size = models.ForeignKey(
        to=ProductSize, on_delete=models.SET_DEFAULT, default=108,)
    varient = models.ForeignKey(
        to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    has_physical_barcode = models.BooleanField(default=False)
    provider = models.ForeignKey(to=Provider, on_delete=models.CASCADE,)
    collected = models.ManyToManyField(
        to=CollectedInventory, related_name='taken_inventory')
    # toOrder = models.IntegerField(default=0)


class MOrderItemEntry(models.Model):
    quantity = models.IntegerField(default=1)
    color = models.ForeignKey(
        to=Color, on_delete=models.SET_DEFAULT, default=76, null=True, blank=True)
    size = models.ForeignKey(
        to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    varient = models.ForeignKey(
        to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return str(self.quantity) + ' ' + str(self.color) + ' ' + str(self.size) + ' ' + str(self.varient)
    pass

    def validate_unique(self, *args, **kwargs):
        super().validate_unique(*args, **kwargs)
        if MOrderItemEntry.objects.filter(orderItem=self.orderItem.all().first(), color=self.color, size=self.size, varient=self.varient).count() > 1:
            raise ValidationError("This product has already been added")


class MOrderItem(models.Model):
    """
    This is the model for the items in the order.
    """
    product = models.ForeignKey(to=CatalogImage, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # quantity = models.IntegerField(default=1)
    # color = models.ForeignKey(to=Color, on_delete=models.SET_DEFAULT,default=76, null=True, blank=True)
    # size = models.ForeignKey(to=ProductSize, on_delete=models.SET_DEFAULT, default=108, null=True, blank=True)
    # varient = models.ForeignKey(to=CatalogImageVarient, on_delete=models.CASCADE, null=True, blank=True)
    # provider = models.ForeignKey(to=Provider, on_delete=models.SET_DEFAULT, default=7)
    providers = models.ManyToManyField(to=Provider, blank=True)
    # clientProvider = models.CharField(max_length=255, null=True, blank=True)
    # clientBuyPrice = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ergent = models.BooleanField(default=False)
    prining = models.BooleanField(default=False)
    priningComment = models.CharField(max_length=255, null=True, blank=True)
    embroidery = models.BooleanField(default=False)
    embroideryComment = models.CharField(max_length=255, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    entries = models.ManyToManyField(
        to=MOrderItemEntry, blank=True, related_name='orderItem')
    taken = models.ManyToManyField(
        to=TakenInventory, blank=True, related_name='orderItem')
    toProviders = models.ManyToManyField(
        to=ProviderRequest, blank=True, related_name='orderItem')
    prop_totalEntriesQuantity = property(lambda self: sum(
        [entry.quantity for entry in self.entries.all()]))
    prop_totalPrice = property(
        lambda self: self.prop_totalEntriesQuantity * self.price)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'product__title', ]

    def __str__(self):
        # str(self.color) + " " + str(self.size) + (" " + self.varient.name) if self.varient != None else ' ' + str(self.quantity) + " " + str(self.price) + '₪'
        return str(self.product) + " | " + str(self.price) + '₪'
# Create your models here.


STATUS_CHOICES = [('new', 'חדש'), ('price_proposal', 'הצעת מחיר'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט',), (
    'in_progress3', 'בהדפסה',), ('in_progress4', 'מוכן בבית דפוס'), ('in_progress5', 'ארוז מוכן למשלוח'), ('done', 'סופק'), ]

LOCKED_CELL_COLOR = {
    'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9},
    'textFormat': {'fontSize': 12},
}


@reversion.register()
class MOrder(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    cart = models.ForeignKey(
        to=SvelteCartModal, on_delete=models.SET_NULL, null=True)
    client = models.ForeignKey(to=Client, on_delete=models.SET_NULL, null=True)
    agent = models.ForeignKey(to=User, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=100, blank=True, null=True, default='')
    phone = models.CharField(max_length=100, blank=True, null=True, default='')
    email = models.CharField(max_length=100, blank=True, null=True, default='')
    status = models.CharField(
        max_length=100, choices=STATUS_CHOICES, default='new')
    status2 = models.ForeignKey(
        to='MorderStatus', on_delete=models.SET_NULL, null=True, blank=True)
    status_msg = models.TextField(_('status message'), blank=True, null=True)
    # order_type = models.CharField(max_length=100, choices=[('Invoice', 'חשבונית מס'), ('RefundInvoice', 'חשבונית זיכוי'), (
    #     'PriceProposal', 'הצעת מחיר'), ('ShippingCertificate', 'תעודת משלוח'), ('ReturnCertificate', 'תעודת החזרה')], blank=True, null=True)
    products = models.ManyToManyField(
        to=MOrderItem, blank=True, related_name='morder')
    message = models.TextField(null=True, blank=True)
    freezeTakenInventory = models.BooleanField(default=False)
    archive = models.BooleanField(default=False)
    isOrder = models.BooleanField(default=False)
    sendProviders = models.BooleanField(default=False)
    startCollecting = models.BooleanField(default=False)
    prop_totalPrice = property(lambda self: sum(
        [item.prop_totalPrice for item in self.products.all()]))
    prop_totalPricePlusTax = property(
        lambda self: self.prop_totalPrice * Decimal('1.17'))

    total_sell_price = models.FloatField(
        _('total sell price'), default=0)
    last_status_updated = models.CharField(
        _('last status updated'), max_length=100, blank=True, null=True)
    gid = models.CharField(max_length=100, blank=True, null=True)
    last_sheet_update = models.DateTimeField(
        _('last sheet update'), null=True, blank=True)

    class Meta:
        ordering = ['-created']

    def sync_with_spreedsheet(self):

        scope = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            GOOGLE_SERVICE_ACCOUNT_FILE, scope)
        gspred_client = gspread.authorize(creds)

        # if self.spreed_sheet_url:
        workbook = gspred_client.open_by_url(ALL_MORDER_FILE_SPREEDSHEET_URL)
        if not self.gid:
            # get data as exel to upload
            self.morder_to_spreedsheet(workbook)
        print(workbook)
        pass
        pass

    def init_spreedsheet(self, ws: gspread.Worksheet, data):
        # ws.update_cell(1, 1, 'מספר הזמנה')
        # ws.update_cell(1, 2, 'תאריך הזמנה')
        # ws.update_cell(1, 3, 'שם הלקוח')
        # ws.update_cell(1, 4, 'הודעה')
        # ws.update_cell(2, 1, data['id'])
        # ws.update_cell(2, 2, data['date'])
        # ws.update_cell(2, 3, data['name'])
        # ws.update_cell(2, 4, data['message'])
        # and another row (headers of the data: )
        #  ['ברקוד	פריט	כמות כוללת	הערות	כמות נלקחת	מחיר מכירה	מע"מ	הדפסה?		רקמה?		ספקים'
        # same as above but with one call
        data_array = [
            ['מספר הזמנה', 'תאריך הזמנה', 'שם הלקוח', 'הודעה'],
            [data['id'], data['date'], data['name'], data['message']],
            ['ברקוד', 'פריט', 'כמות כוללת', 'הערות', 'כמות נלקחת',
                'מחיר מכירה', 'מע"מ', 'הדפסה?', '', 'רקמה?', '', 'ספקים'],
        ]
        # range from A1 to data_array dimensions
        # get the longest row in data_array
        longest_row_length = 0
        for i, row in enumerate(data_array):
            if len(row) > longest_row_length:
                longest_row_length = len(row)
        range = 'A1:' + \
            number_to_spreedsheet_letter(
                longest_row_length) + str(len(data_array))
        ws.update(range, data_array, value_input_option='USER_ENTERED')
        ws.format(range, LOCKED_CELL_COLOR)

        pass

    def morder_to_spreedsheet(self, wb: gspread.Spreadsheet):
        order_data = self.get_exel_data()
        name = order_data['name']
        order_products = order_data['products']
        all_products = {}
        for order_product in order_products:
            product_name = order_product['title']
            if product_name not in all_products:
                all_products[product_name] = {
                    'entries': copy.deepcopy(order_product['entries']),
                    'comment': (name + ': ' + order_product['comment'] + '\n') if order_product['comment'] else '',
                    'barcode': order_product['barcode'],
                    'total_quantity': 0,
                    'details': [],
                }
            else:
                # all_products[product_name] += product['entries']
                entries = all_products[product_name]['entries']
                for entry in order_product['entries'].keys():
                    if entry in entries:
                        entries[entry] += order_product['entries'][entry]
                    else:
                        entries[entry] = order_product['entries'][entry]
                all_products[product_name]['entries'] = entries

                all_products[product_name]['comment'] += (
                    name + ': ' + order_product['comment'] + '\n') if order_product['comment'] else ''
            all_products[product_name]['total_quantity'] += order_product['total_quantity']
            all_products[product_name]['details'].append(
                name + ' - ' + str(order_product['total_quantity']))
            pass  # end loop on order products

        headers = ['ברקוד', 'פריט', 'כמות כוללת', 'הערות',
                   'כמות נלקחת', 'מחיר מכירה', 'מע"מ', 'הדפסה?', '', 'רקמה?', '', ]
        try:
            order_ws = wb.add_worksheet(
                order_data['name'] + ' ' + str(order_data['id']), 0, 0)
        except:
            order_ws = wb.worksheet(
                order_data['name'] + ' ' + str(order_data['id']))
        sheetId = wb.id
        batch_request = {
            "requests": [
                {
                    "updateSheetProperties": {
                        "properties": {
                            "sheetId": sheetId,
                            # "gridProperties": {
                            #     "rowCount": 1,
                            #     "columnCount": 1,
                            # },
                            "rightToLeft": True,
                        },
                        # "fields": "gridProperties(rowCount, columnCount),rightToLeft"
                        "fields": "rightToLeft"
                    },
                }
            ],
        }
        result1 = wb.batch_update(batch_request)
        self.init_spreedsheet(order_ws, order_data)

        raise Exception('my error')
        pass

    def subtract_collected_inventory(self, user):
        collected_items = CollectedInventory.objects.filter(
            taken_inventory__orderItem__morder=self)
        for item in collected_items:
            entry = item.warehouseStock
            qyt = item.quantity
            entry.history.create(old_quantity=item.warehouseStock.quantity,
                                 new_quantity=item.warehouseStock.quantity - qyt,
                                 note='הזמנה ' + str(self.id),
                                 user=user)
            entry.quantity = item.warehouseStock.quantity-qyt
            entry.save()

    def morder_to_smartbe_json(self):
        collected_items = CollectedInventory.objects.filter(
            taken_inventory__orderItem__morder=self)
        vals = collected_items.values('warehouseStock__ppn__product__id', 'warehouseStock__ppn__product__title', 'warehouseStock__ppn__barcode', 'taken_inventory__orderItem__price').order_by('warehouseStock__ppn__product__title', 'warehouseStock__ppn__barcode').annotate(quantity=Sum('quantity'), providerItemId=F('warehouseStock__ppn__product__id'), barcodeLen=Length(F('warehouseStock__ppn__barcode')), catNumber=F(
            'warehouseStock__ppn__product__id'), pricePerUnit=F('taken_inventory__orderItem__price'), vatOption=Value("NotInclude", output_field=models.CharField()), description=Case(When(barcodeLen__gte=1, then=Concat(F('warehouseStock__ppn__barcode',), Value(' | '), F('warehouseStock__ppn__product__title'))), default=F('warehouseStock__ppn__product__title'),)).values('quantity', 'providerItemId', 'catNumber', 'pricePerUnit', 'vatOption', 'description')

        info = {
            "providerUserToken": SMARTBEE_providerUserToken,
            "providerMsgId": datetime.datetime.now().strftime("%Y%m%d%H%M%S"),
            "providerMsgReferenceId": "something 123456",
            "customer": {
                'providerCustomerId': self.client.user.id if self.client else None,
                'name': self.name,
                # 'email': self.email,
                # 'mainPhone': self.phone,
                'dealerNumber': self.client.privateCompany if self.client else None,
                'netEOM': 30,
            },
            "docType": "Invoice",
            "createDraftOnFailure": True,
            "dueDate": self.updated.strftime("%Y-%m-%d"),
            "title": 'הזמנה מספר ' + str(self.id),
            "extraCommentsForEmail": "",
            "currency": {
                "currencyType": "ILS",
                "rate": 0
            },
            "documentItems": {
                "paymentItems": list(vals),
                "discount": {
                    "discountValueType": "Percentage",
                    "value": 0
                },
                "roundTotalSum": True
            },
            "isSendOrigEng": False,
            "docDate": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S+03:00"),
        }
        return info

    def create_smartbe_order(self):
        info = self.morder_to_smartbe_json()
        print('providerMsgId: ', info['providerMsgId'])
        smartbee_auth = SmartbeeTokens.get_or_create_token()
        headers = {"Authorization": "Bearer " + smartbee_auth.token}
        smartbee_response = requests.post(
            SMARTBEE_DOMAIN + '/api/v1/documents/create', json=info, headers=headers)
        if smartbee_response.status_code == 200:
            # self.isOrder = True
            # self.save()
            data = smartbee_response.json()
            SmartbeeResults.objects.create(morder=self,
                                           resultCodeId=data['resultCodeId'],
                                           result=data['result'],
                                           validationErrors=data['validationErrors'],)
            print(data)
            return data
        else:
            print(smartbee_response)
            print(smartbee_response.json())

    def get_exel_data(self):
        # שם	כמות	מחיר מכירה ללא מע"מ	ספקים
        products = []
        qs = self.products.all().select_related('product').prefetch_related(
            'entries', 'providers', 'entries__color', 'entries__size', 'entries__varient')
        for item in qs:
            # Entry: quantity,color,size, varient
            entries = {}
            defualt_color = Color.objects.get(pk=76)
            defualt_size = ProductSize.objects.get(pk=108)
            for entry in item.entries.all():
                color = entry.color.name if entry.color != None else defualt_color.name
                color_order = entry.color.name if entry.color != None else defualt_color.name
                size = entry.size.size if entry.size != None else defualt_size.size
                size_order = entry.size.code if entry.size != None else defualt_size.code
                varient = entry.varient.name if entry.varient != None else ''
                key = tuple([color, size, varient, color_order, size_order])
                # entries.append([color, size,varient,entry.quantity])
                entries[key] = entry.quantity
            item_data = {'title': item.product.title, 'total_quantity': item.prop_totalEntriesQuantity,
                         'price': item.price,
                         'price_tax': item.price * Decimal('1.17'),
                         'providers': ','.join([provider.name for provider in item.providers.all()]),
                         'comment': item.comment if item.comment != None else '',
                         'barcode': item.product.barcode if item.product.barcode != None else '',
                         'prining': item.prining,
                         'priningComment': item.priningComment,
                         'embroidery': item.embroidery,
                         'embroideryComment': item.embroideryComment,
                         'entries': entries}
            products.append(item_data)
        data = {
            'name': self.name if self.name != None else self.client.business_name if self.client.business_name != None else '',
            'products': products,
            'message': self.message if self.message != None else '',
            'date': self.created.strftime('%d_%m_%Y'),
            'id': self.id,
        }
        return data

    def view_morder_stock_document_link(self):
        link = reverse('view_morder_stock_document', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'הצג מסמך הוצאה מהמלאי'))

    def view_morder_pdf_link(self):
        link = reverse('view_morder_pdf', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'הצג הזמנה'))

    def get_edit_url(self):
        link = reverse('admin_edit_order', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'ערוך'))

    def products_display(self):
        products = []
        qs = self.products.all().prefetch_related(
            'product', 'size', 'color', 'varient', 'provider')
        for p in qs:
            size = p.size.size if p.size != None else ' '
            color = p.color.name if p.color != None else ' '
            verient = p.varient.name if p.varient != None else ' '
            products.append({'product': p.product.title, 'quantity': int(p.quantity), 'price': p.price, 'color': color, 'size': size, 'varient': verient,
                            'comment': p.comment, 'clientBuyPrice': p.clientBuyPrice, 'clientProvider': p.clientProvider, 'provider': p.provider.name})
        try:
            df = pd.DataFrame(products)
        except Exception as e:
            print(e)
            return ' '
        print(df.columns)
        print(df.head())
        # df['cell_display'] = df['quantity'].astype(str)# + ' ' + df['price'].astype(str) + '₪'
        # df['price_display'] = df['price'] + '₪'
        if len(df) == 0:
            return mark_safe(df.to_html(index=False))
        df = df.pivot(index=['product', 'color', 'varient',
                             'price'], columns='size', values=['quantity'])

        print(df.columns)
        print(df.head())
        html = df.to_html(index=True, header=True,
                          table_id='table_id', na_rep='-')
        return mark_safe(html)

    def get_status_display(self):
        status = self.status
        # STATUS_CHOICES = [('new', 'חדש'), ('price_proposal',....
        for choice in STATUS_CHOICES:
            if choice[0] == status:
                return choice[1]

    def get_edit_order_url(self):
        return reverse('admin_edit_order', args=(self.pk,))
        # morders/edit-order/{self.pk}/
# @receiver(pre_save, sender=MOrder)
# def check_for_status_update(sender, instance, *args, **kwargs):

#     pass


@receiver(pre_save, sender=MOrder, dispatch_uid="recalculate_total_price")
def recalculate_total_price_pre_save(sender, instance, **kwargs):
    if instance.pk:
        new_price = instance.prop_totalPrice
        if instance.total_sell_price != new_price:
            instance.total_sell_price = new_price


@receiver(post_save, sender=MOrder, dispatch_uid="notify_order_status_update")
def notify_order_status_update_post_save(instance, *args, **kwargs):
    if instance.total_sell_price > 0:
        edit_url = SECRECT_CLIENT_SIDE_DOMAIN + instance.get_edit_order_url()
        status = instance.get_status_display()
        name = instance.name or instance.client.businessName
        total_sell = instance.total_sell_price
        if settings.DEBUG:
            pass
            # send_morder_status_update_to_telegram(
            #     edit_url=edit_url, status=status, name=name, total_price=total_sell, morder_id=instance.id)
        else:
            send_morder_status_update_to_telegram.delay(
                edit_url=edit_url, status=status, name=name, total_price=total_sell, morder_id=instance.id)

    # print('recalculate_total_price_post_save: ', instance.total_sell_price)


class MorderStatus(OrderedModelBase):
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_('name'))
    sort_order = models.PositiveIntegerField(editable=False, db_index=True)
    order_field_name = "sort_order"

    class Meta:
        ordering = ("sort_order",)

    def __str__(self):
        return self.name
