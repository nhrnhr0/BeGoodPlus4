from colorfield.fields import ColorField
import re
from begoodPlus.secrects import FULL_DOMAIN
import pytz
from core.gspred import get_gspread_client
from gspread.cell import Cell
from gspread_formatting import *
from openpyxl.styles import Alignment
import copy

import gspread
from ordered_model.models import OrderedModelBase
from begoodPlus.secrects import SECRECT_BASE_MY_DOMAIN, SECRECT_CLIENT_SIDE_DOMAIN, ALL_MORDER_FILE_SPREEDSHEET_URL, ALL_PRICE_PROPOSAL_SPREEADSHEET_URL
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
    # sheets_taken_quantity = models.IntegerField(default=0)
    sheets_taken_quantity = models.CharField(
        max_length=255, null=True, blank=True)
    sheets_provider = models.CharField(max_length=255, null=True, blank=True)

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

BLANK_CELL_COLOR = {
    'backgroundColor': {'red': 1, 'green': 1, 'blue': 1},
    'textFormat': {'fontSize': 12},
    'borders': {
        'top': {
            'style': 'SOLID',
            'width': 1,
            'color': {'red': 0.9, 'green': 0.9, 'blue': 0.9},
        },
        'bottom': {
            'style': 'SOLID',
            'width': 1,
            'color': {'red': 0.9, 'green': 0.9, 'blue': 0.9},
        },
    },
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
    price_proposal_sheetid = models.CharField(
        max_length=100, blank=True, null=True)
    last_sheet_update = models.DateTimeField(
        _('last sheet update'), null=True, blank=True)
    export_to_suppliers = models.BooleanField(default=False)
    last_notify_order_status = models.CharField(
        max_length=100, blank=True, null=True)
    last_notify_order_total_price = models.FloatField(
        _('last notify order total price'), default=0)
    # save

    def recalculate_total_price(self):
        if self.pk:
            # new_price = self.prop_totalPrice
            # if self.total_sell_price != new_price:
            #     self.total_sell_price = new_price
            # pass

            # we iterete over all products
            # for each product we sum the total amount and multiply it by the price
            # we sum all the products total price
            # we compare the total price to self.total_sell_price
            total_price = 0
            for product in self.products.all():
                # product.price
                # sum(product.entries.all().quantity)
                total_price += product.price * \
                    sum(product.entries.all().values_list('quantity', flat=True))
            if self.total_sell_price != total_price:
                self.total_sell_price = total_price

    def notify_order_status_update(self):
        from morders.tasks import send_morder_status_update_to_telegram
        print('notify_order_status_update_post_save: ', self.total_sell_price)
        if self.total_sell_price > 0:
            # we compare self.total_sell_price to self
            # kkkkkkkkk
            edit_url = SECRECT_BASE_MY_DOMAIN + self.get_edit_order_url()
            status = self.get_status_display()
            name = self.name or self.client.businessName
            total_sell = self.total_sell_price

            # we check if last_notify_order_status is not the same as status
            # or last_notify_order_total_price is not the same as total_sell_price
            if self.last_notify_order_status != status.name or self.last_notify_order_total_price != total_sell:
                if settings.DEBUG:
                    pass
                    print('send_morder_status_update_to_telegram')
                    # send_morder_status_update_to_telegram(
                    #     edit_url=edit_url, status=status, name=name, total_price=total_sell, morder_id=self.id)
                else:
                    send_morder_status_update_to_telegram.delay(
                        edit_url=edit_url, status=status.name, name=name, total_price=total_sell, morder_id=self.id)
                    pass
                self.last_notify_order_status = status.name
                self.last_notify_order_total_price = total_sell
                self.save()
            else:
                print('no need to send notification')
                pass
        print('done notify_order_status_update_post_save: ', self.total_sell_price)
        pass

    def update_sell_price_from_price_proposal_sheet(self, sheet_id=None):
        #
        if not sheet_id:
            sheet_id = self.price_proposal_sheetid
        if not sheet_id:
            return ['sheet_id is None']
        gspred_client = get_gspread_client()
        workbook = gspred_client.open_by_url(
            ALL_PRICE_PROPOSAL_SPREEADSHEET_URL)

        ws = list(filter(lambda ws: ws.id == int(
            sheet_id), workbook.worksheets()))

        if not ws:
            return ['sheet_id ' + sheet_id + ' not found in ' + str(workbook.worksheets())]
        ws = ws[0]
        ROW_OFFSET = 5
        PRODUCT_NAME_COL = 1
        SELL_PRICE_COL = 8
        erorrs = []
        for row in range(ROW_OFFSET, ws.row_count):
            product_name = ws.cell(row, PRODUCT_NAME_COL).value
            sell_price = ws.cell(row, SELL_PRICE_COL).value
            if not product_name:
                break
            try:
                product = self.products.get(product__title=product_name)
                product.price = sell_price
                product.save()
            except Exception as e:
                print(e)
                erorrs.append(
                    f'error in  {product_name} \n' + str(e))
        return erorrs

    def get_sheets_order_link(self):
        ret = ''
        if self.gid:
            ret = ALL_MORDER_FILE_SPREEDSHEET_URL

            ret = re.sub(r'#gid=\d+', f'#gid={self.gid}',
                         ALL_MORDER_FILE_SPREEDSHEET_URL)
        return ret

    def get_sheets_price_prop_link(self):
        ret = ''
        if self.price_proposal_sheetid:
            ret = ALL_PRICE_PROPOSAL_SPREEADSHEET_URL
            ret = re.sub(r'#gid=\d+', f'#gid={self.price_proposal_sheetid}',
                         ALL_PRICE_PROPOSAL_SPREEADSHEET_URL)

        return ret

    def save(self, *args, **kwargs):
        from docsSignature.utils import create_signature_doc_from_morder
        try:
            # create_signature_doc_from_morder(self)
            pass
        except Exception as e:
            print(e)

        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created']

    def spreedsheet_to_morder(self, gid=None):
        gspred_client = get_gspread_client()
        workbook = gspred_client.open_by_url(ALL_MORDER_FILE_SPREEDSHEET_URL)
        # Israel timezone now
        now = datetime.datetime.now(pytz.timezone('Asia/Jerusalem'))
        self.last_sheet_update = now
        if gid:
            self.gid = gid
            self.save()
        if self.gid:
            # get data as exel to upload
            ws = list(filter(lambda ws: ws.id == int(
                self.gid), workbook.worksheets()))
            if ws:
                ws = ws[0]
            sheets_data = self.read_morder_from_spreedsheet(ws)

        else:
            ws = MOrder.get_or_create_order_sheet(
                workbook, self.name + ' ' + str(self.id))
            self.gid = ws.id
            self.save()
            sheets_data = self.read_morder_from_spreedsheet(ws)
        # print(sheets_data)
        # update last update time in spreedsheet E2

        errors = self.spreedsheet_data_to_morder(sheets_data)
        ws.update_cell(2, 5, now.strftime('%d/%m/%Y %H:%M:%S'))
        ws.update_cell(2, 6, str(errors))
        return errors

    def start_morder_to_spreedsheet_thread(self, sync_price_proposal=True, sync_order=True):
        import threading
        print('starting thread')
        t = threading.Thread(target=self.morder_to_spreedsheet, args=(
            sync_price_proposal, sync_order))

        t.start()

    def morder_to_spreedsheet(self, sync_price_proposal=True, sync_order=True):
        gspred_client = get_gspread_client()
        self.last_sheet_update = datetime.datetime.now()
        print('morder to spreedsheet')

        if sync_price_proposal:
            workbook = gspred_client.open_by_url(
                ALL_PRICE_PROPOSAL_SPREEADSHEET_URL)
            self.write_morder_to_price_prop_spreedsheet(
                gspred_client, workbook)
        if sync_order:
            workbook = gspred_client.open_by_url(
                ALL_MORDER_FILE_SPREEDSHEET_URL)
            self.write_morder_to_spreedsheet(workbook)

    pass

    def get_data_to_price_proposal_spreedsheet(self):
        # get the product name, total amount and product.product.cost_price
        ret = []
        for p in self.products.select_related('product').all():
            ret.append(
                [p.product.title, p.prop_totalEntriesQuantity, p.product.cost_price, p.price])
        return ret

    def write_morder_to_price_prop_spreedsheet(self, gspred_client, workbook):
        worksheet = self.get_or_create_price_proposal_sheet(
            gspred_client, workbook)
        self.price_proposal_sheetid = worksheet.id

        data = self.get_data_to_price_proposal_spreedsheet()
        admin_edit_link = self.get_edit_url_without_html(base_url=FULL_DOMAIN)

        # print(data)  # ['פנדה מונביסו', Decimal('15040.00'), 220.0]...
        # Col A from offset 4:
        # product name
        # Col B from offset 4:
        # amount
        # Col C from offset 4:
        # cost price
        # write data to spreedsheet

        # data = [title, amount, cost, price]
        # A title
        # B amount
        # C cost
        # H price
        a_to_c = list(map(lambda x: x[:3], data))
        worksheet.update('A5:C', a_to_c)

        # update col H price
        h = list(map(lambda x: [int(x[3]) if int(
            x[3]) == float(x[3]) else float(x[3])], data))
        worksheet.update('H5:H', h)

        # H2 - admin edit link

        worksheet.update('H2', admin_edit_link)
        worksheet.update('I2', self.status2.name)

        # A2 client name
        worksheet.update('A2', self.name)
        # B2 client phone
        worksheet.update('B2', self.phone)

        GREEN_COLOR = {
            "red": 0,
            "green": 1,
            "blue": 0
        }
        RED_COLOR = {
            "red": 1,
            "green": 0,
            "blue": 0
        }
        if self.status2:
            # if status2.name == 'חדש':
            #     color = GREEN_COLOR
            # elif status2.name == 'בוטל':
            #     color = RED_COLOR
            # else:
            #     do nothing
            if self.status2.name == 'בוטל':
                color = RED_COLOR
            elif self.status2.name == 'חדש':
                color = GREEN_COLOR
            else:
                color = None
            if color:
                body = {
                    "requests": [
                        {
                            "updateSheetProperties": {
                                "properties": {
                                    "sheetId": worksheet.id,
                                    # "title": title, # In this case, I think that this might not be required to be used.
                                    "tabColor": color,
                                },
                                "fields": "tabColor"
                            }
                        }
                    ]
                }
                workbook.batch_update(body)

            # print(res)

        # if self.client:
        #     # C2 client contact name
        #     worksheet.update('C2', self.client.businessName)
        #     # D2 client email
        #     worksheet.update('D2', self.client.email)
        #     # E2 client address
        #     worksheet.update('E2', self.client.address)

        self.save()

    def spreedsheet_data_to_morder(self, sheets_data):
        # sheets_data = [['מספר הזמנה', 'תאריך הזמנה', 'שם הלקוח', 'הודעה', '', '', '', '', '', '', '', ''], ['262', '27_10_2022', 'ש.א מכולת', '', '', '', '', '', '', '', '', ''], ['ברקוד', 'פריט', 'כמות כוללת', 'הערות', 'כמות נלקחת', 'מחיר מכירה', 'מע"מ', 'הדפסה?', '', 'רקמה?', '', 'ספקים'], ['"676525047815"', 'מכנס בנאים משולב כותנה ולייקרה', '9', '', '', '100.00₪', 'לא כולל', 'לא', '', 'לא', '', ''], ['אפור כהה', 'S', '', '4', '', '', '', '', '', '', '', ''], ['אפור כהה', 'M', '', '3', '', '', '', '', '', '', '', ''], ['אפור כהה', 'L', '', '2', '', '', '', '', '', '', '', ''], ['', 'מנעול 25 מ"מ', '0', '', '', '1.00₪', 'לא כולל', 'לא', '', 'לא', '', ''], ['', 'פיתוח גלופה', '0', '', '', '100.00₪', 'לא כולל', 'לא', '', 'לא', '', ''], ['"676525009592"', 'חולצת טריקו שרוול ארוך', '18', '', '', '19.00₪', 'לא כולל', 'לא', '', 'לא', '', ''],['כחול כהה', 'S', '', '6', '', '', '', '', '', '', '', ''], ['כחול כהה', 'M', '', '6', '', '', '', '', '', '', '', ''], ['כחול כהה', 'L', '', '6', '', '', '', '', '', '', '', ''], ['8011222022116', 'סט 3 קופסאות קליפר', '6', '', '', '19.00₪', 'לא כולל', 'לא', '', 'לא', '', ''], ['8710002569451', 'צולה כבד קטן', '3', '', '', '11.00₪', 'לא כולל', 'לא', '', 'לא', '', ''], ['7290004469634', 'כוס ילדים + ידית', '6', '', '', '3.50₪', 'לא כולל', 'לא', '', 'לא', '', '']]
        # first 2 rows are user data (1st the headers and 2cend the data)
        # third row is headers for the items
        # the rest are the items (each row can be main row or sub row)
        # determine by the J column (if it is not empty it is main row)
        # if it is empty it is sub row
        errors = []
        if len(sheets_data) < 4:
            errors.append('קובץ ריק')
            return errors
        # order_number = sheets_data[1][0]
        # order_date = sheets_data[1][1]
        # customer_name = sheets_data[1][2]
        # order_message = sheets_data[1][3]

        def is_header_row(row):
            return not str(row[9]) == ''
        if(sheets_data[0][6] == 'סטטוס'):
            new_status = sheets_data[1][6]
            if not self.status2.name == new_status and not new_status == '':
                status_obj, created = MorderStatus.objects.get_or_create(
                    name=new_status)
                self.status2 = status_obj

        # I1 = לקחת לספקים?
        # I2 = <has any>
        if(sheets_data[0][8] == 'לקחת לספקים?'):
            new_export_to_suppliers = sheets_data[1][8]
            if new_export_to_suppliers != None and new_export_to_suppliers != '':
                self.export_to_suppliers = True
            else:
                self.export_to_suppliers = False
            # export_to_suppliers
        all_products = {}
        # all_products = {product.title: {'title': product.title, 'price': product.price, 'vat': product.vat, 'provider': product.provider, entries: [{size: 'S',varient:'', quantity: 1, provider: 'ספק 1', 'taken':'v'}, {size: 'M',varient:'', quantity: 1, provider: 'ספק 1', 'taken':3}]}]}}
        for row in sheets_data[3:]:
            is_header = is_header_row(row)
            if is_header:
                product = {}
                product['title'] = row[1]
                product['price'] = row[5]
                product['vat'] = row[6]
                product['provider'] = row[11]
                product['entries'] = []
                product['main_quantity'] = row[2]
                product['main_taken'] = row[4]
                product['main_provider'] = row[11]
                all_products[product['title']] = product
            else:
                entry = {}
                entry['color'] = row[0]
                entry['size'] = row[1]
                entry['varient'] = row[2]
                entry['quantity'] = row[3]
                entry['taken'] = row[4]
                entry['provider'] = row[11]
                all_products[product['title']]['entries'].append(entry)

        for product in all_products.values():
            # get or create the product from the order
            qs = self.products.filter(product__title=product['title'])
            if qs.exists():
                order_product = qs.first()
            else:
                catalogImage = CatalogImage.objects.filter(
                    title=product['title']).first()
                if catalogImage:
                    order_product = MOrderItem.objects.create(
                        price=product['price'], product=catalogImage)
                    self.products.add(order_product)
                else:
                    order_product = None
                    errors.append(
                        f'הפריט {product["title"]} לא קיים במערכת')
            if order_product:
                if len(product['entries']) == 0:
                    order_entry = order_product.entries.first()
                    try:
                        order_entry.quantity = int(product['main_quantity'])
                    except:
                        errors.append(
                            f'כמות {product["main_quantity"]} לא תקינה' + f' פריט {product["title"]}')
                    try:
                        order_entry.sheets_taken_quantity = product['main_taken'] or ''
                    except:
                        errors.append(
                            f'כמות {product["main_taken"]} לא תקינה' + f' פריט {product["title"]}')
                    try:
                        order_entry.sheets_provider = product['main_provider']
                    except:
                        errors.append(
                            f'ספק {product["main_provider"]} לא תקין' + f' פריט {product["title"]}')
                    if order_entry:
                        order_entry.save()
                else:
                    for entry in product['entries']:
                        # get or create the entry from the order
                        if entry['varient']:
                            qs = order_product.entries.filter(
                                color__name=entry['color'], size__size=entry['size'], varient__name=entry['varient'])
                        else:
                            qs = order_product.entries.filter(
                                color__name=entry['color'], size__size=entry['size'], )

                        if qs.exists():
                            order_entry = qs.first()
                        else:
                            clrObj = Color.objects.filter(
                                name=entry['color']).first()
                            if not clrObj:
                                errors.append(
                                    f'הצבע {entry["color"]} לא קיים במערכת' + f' פריט {product["title"]}')
                                continue
                            sizeObj = ProductSize.objects.filter(
                                size=entry['size']).first()
                            if not sizeObj:
                                errors.append(
                                    f'הגודל {entry["size"]} לא קיים במערכת' + f' פריט {product["title"]}')
                                continue
                            if entry['varient']:
                                varientObj = CatalogImageVarient.objects.filter(
                                    name=entry['varient']).first()
                                if not varientObj:
                                    errors.append(
                                        f'המודל {entry["varient"]} לא קיים במערכת' + f' פריט {product["title"]}')
                                    continue
                                order_entry = MOrderItemEntry.objects.create(
                                    color=clrObj, size=sizeObj, varient=varientObj)
                            else:
                                order_entry = MOrderItemEntry.objects.create(
                                    color=clrObj, size=sizeObj, varient=None)
                            order_product.entries.add(order_entry)
                        try:
                            order_entry.quantity = int(entry['quantity'])
                        except:
                            errors.append(
                                f'כמות {entry["quantity"]} לא תקינה' + f' פריט {product["title"]}')
                        # try:
                        order_entry.sheets_taken_quantity = entry['taken'] or ''
                        # except:
                        #     errors.append(
                        #         f'כמות שנלקחה {entry["taken"]} לא תקינה' + f' פריט {product["title"]}')
                        order_entry.sheets_provider = entry['provider']
                        # loop end
                        order_entry.save()
                    order_product.save()
        self.save()
        return errors

    def read_morder_from_spreedsheet(self, worksheet: gspread.Worksheet):
        data = worksheet.get_all_values()
        # print(data)
        return data

    def get_or_create_order_sheet(wb, title):
        try:
            return wb.worksheet(title)
        except:
            order_ws = wb.add_worksheet(title=title, rows=0, cols=0)
            sheetId = wb.id
            batch_request = {
                "requests": [
                    {
                        "updateSheetProperties": {
                            "properties": {
                                "sheetId": order_ws.id,
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
            wb.batch_update(batch_request)
            return order_ws

    def get_or_create_price_proposal_sheet(self, gspred_client, wb, title=None):
        if not title:
            if self.price_proposal_sheetid:
                for ws in wb.worksheets():
                    if str(ws.id) == self.price_proposal_sheetid:
                        return ws
            title = str(self.id) + ' ' + self.name + \
                ' ' + self.created.strftime('%Y_%m_%d')
        try:
            return wb.worksheet(title)
        except:
            spreedsheet_id = wb.id
            baseSheetId = wb.worksheet('בסיס להצעת מחיר').id
            request_body = {
                'requests': {
                    'duplicateSheet': {
                        'sourceSheetId': baseSheetId,
                        'newSheetName': title,
                    },
                },
            }
            from core.gspred import get_google_service
            service = get_google_service()
            # service.spreadsheets().batchUpdate
            response = service.spreadsheets().batchUpdate(
                spreadsheetId=spreedsheet_id,
                body=request_body
            ).execute()
            return wb.worksheet(title)

    def init_spreedsheet(self, ws: gspread.Worksheet, data, wb):
        # validation_rule = DataValidationRule(
        #     BooleanCondition('ONE_OF_LIST', ['1', '2', '3', '4']),
        #     showCustomUi=True
        # )
        # cells_range = 'A1:A1000'
        # set_data_validation_for_cell_range(ws, cells_range, validation_rule)
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
        current_time = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        # =HYPERLINK("https://testing.boost-pop.com/morders/edit-order/517", "517")
        data_array = [
            ['מספר הזמנה', 'תאריך הזמנה', 'שם הלקוח', 'הודעה',
                'עדכון אחרון', 'שגיאות', 'סטטוס', 'קישור לאדמין'],
            [data['id'], data['date'], data['name'],
                data['message'], current_time, '', data['status'], data['admin_link']],
            ['ברקוד', 'פריט', 'כמות כוללת', 'הערות', 'כמות נלקחת',
                'מחיר מכירה', 'מע"מ', 'הדפסה?', '', 'רקמה?', '', 'ספקים'],
        ]
        # range from A1 to data_array dimensions
        # get the longest row in data_array
        longest_row_length = 0
        for i, row in enumerate(data_array):
            if len(row) > longest_row_length:
                longest_row_length = len(row)
        headers_range = 'A1:' + \
            number_to_spreedsheet_letter(
                longest_row_length) + str(len(data_array))
        ws.update(headers_range, data_array,
                  value_input_option='USER_ENTERED')

        ws.format(headers_range, LOCKED_CELL_COLOR)

        # reset all the other cells to blank data and format them
        all_other_cells_range = 'A4:' + \
            'M' + str(len(data_array) + 1000)
        ws.update(all_other_cells_range, [[''] * longest_row_length] * 1000)
        # ws.format(all_other_cells_range, BLANK_CELL_COLOR)
        # clear all data validation
        set_data_validation_for_cell_range(ws, all_other_cells_range, None)

        all_statuses = list(
            MorderStatus.objects.all().values_list('name', flat=True))
        status_validation_rule = DataValidationRule(
            BooleanCondition('ONE_OF_LIST', all_statuses),
            showCustomUi=True
        )
        set_data_validation_for_cell_range(
            ws, 'G2:G2', status_validation_rule)

        # create a title at I1 cell: "לקחת לספקים?"
        ws.update_cell(1, 9, 'לקחת לספקים?')
        # create a checkbox at I2 cell
        if data['export_to_suppliers']:
            ws.update_cell(2, 9, data['export_to_suppliers'])
        else:
            ws.update_cell(2, 9, '')

        if self.status2:
            # change hex to rgb

            rgb = tuple(
                int(self.status2.color[1:][i:i+2], 16) for i in (0, 2, 4))
            # rbg = (255, 255, 255)
            # change to 0-1
            rgb = tuple(map(lambda x: x/255, rgb))
            # color the spreedsheet
            body = {
                "requests": [
                    {
                        "updateSheetProperties": {
                            "properties": {
                                "sheetId": ws.id,
                                # "title": title, # In this case, I think that this might not be required to be used.
                                "tabColor": {
                                    "red": rgb[0],
                                    "green": rgb[1],
                                    "blue": rgb[2]
                                },
                            },
                            "fields": "tabColor"
                        }
                    }
                ]
            }
            res = wb.batch_update(body)
        print(res)

    def write_morder_to_spreedsheet(self, wb: gspread.Spreadsheet):
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
        # get or create sheet:
        # try:
        #     order_ws = wb.add_worksheet(
        #         order_data['name'] + ' ' + str(order_data['id']), 0, 0)
        # except:
        #     order_ws = wb.worksheet(
        #         order_data['name'] + ' ' + str(order_data['id']))
        order_ws = MOrder.get_or_create_order_sheet(
            wb, order_data['name'] + ' ' + str(order_data['id']) + ' ' + order_data['date'])

        self.gid = order_ws.id

        self.init_spreedsheet(order_ws, order_data, wb)
        # write products to sheet:

        self.write_products_to_spreedsheet(order_ws, order_data['products'])
        self.save()
        # raise Exception('my error')
        pass

    def write_products_to_spreedsheet(self, order_ws: gspread.Worksheet, order_products: dict, starting_row: int = 4):
        # write products to sheet same as (export to exel from admin)
        from gspread_formatting import Color
        # add border bottom to header
        pink_header_format = CellFormat(
            backgroundColor=Color(1, 0.8, 1),
            textFormat=TextFormat(bold=True, foregroundColor=Color(0, 0, 0)),
            horizontalAlignment='RIGHT', borders=Borders(bottom=Border('SOLID', Color(0, 0, 0))))
        # 'backgroundColor': {'red': 0.9, 'green': 0.9, 'blue': 0.9},'textFormat': {'fontSize': 12},
        subtable_header_format = CellFormat(
            backgroundColor=Color(0.9, 0.9, 0.9),
            textFormat=TextFormat(
                bold=True, foregroundColor=Color(0, 0, 0), fontSize=12),
            horizontalAlignment='RIGHT',)
        # more greenish
        user_input_format = CellFormat(
            backgroundColor=Color(0.75, 1, 0.75),
            textFormat=TextFormat(bold=True, foregroundColor=Color(0, 0, 0)),
            horizontalAlignment='CENTER',)

        PINK_HEADER_FORMAT_CONST = 'PINK_FORMAT_HEADER'
        SUBTABLE_HEADER_FORMAT_CONST = 'SUBTABLE_HEADER_FORMAT'
        USER_INPUT_FORMAT_CONST = 'USER_INPUT_FORMAT'

        all_formats = {
            PINK_HEADER_FORMAT_CONST: pink_header_format,
            SUBTABLE_HEADER_FORMAT_CONST: subtable_header_format,
            USER_INPUT_FORMAT_CONST: user_input_format,

        }
        # cell_formats = [PINK_FORMAT_HEADER,
        #                 SUBTABLE_HEADER_FORMAT, USER_INPUT_FORMAT]

        all_providers = list(
            map(lambda x: x[0], Provider.objects.all().values_list('name')))
        providers_validation_rule = DataValidationRule(
            BooleanCondition('ONE_OF_LIST', all_providers),
            showCustomUi=True
        )
        # format_cell_range(order_ws, 'A1:J1', fmt)
        current_row = starting_row
        sheet_cells_to_update = []
        providers_data_validetions_tasks = []
        formating_tasks = []
        for order_product in order_products:
            product_name = order_product['title']
            barcode = order_product['barcode']
            total_quantity = order_product['total_quantity']
            comment = order_product['comment']
            taken = list(order_product['entries'].values())[0]['taken'] if len(
                order_product['entries']) == 1 else ''
            if taken == '0' or taken == 0:
                taken = ''
            provider = list(order_product['entries'].values())[0]['provider'] if len(
                order_product['entries']) == 1 else ''
            price = str(order_product['price']) + '₪'
            not_include = 'לא כולל'
            is_printing = 'כן' if order_product['prining'] else 'לא'
            prining_comment = order_product['priningComment'] if order_product['prining'] else ''
            is_embroidery = 'כן' if order_product['embroidery'] else 'לא'
            embroidery_comment = order_product['embroideryComment'] if order_product['embroidery'] else ''
            # order_ws.update_cells([
            #     Cell(row=current_row, col=1, value=barcode),
            #     Cell(row=current_row, col=2, value=product_name),
            #     Cell(row=current_row, col=3, value=total_quantity),
            #     Cell(row=current_row, col=4, value=comment),
            #     Cell(row=current_row, col=5, value=taken),
            #     Cell(row=current_row, col=6, value=price),
            #     Cell(row=current_row, col=7, value=not_include),
            #     Cell(row=current_row, col=8, value=is_printing),
            #     Cell(row=current_row, col=9, value=prining_comment),
            #     Cell(row=current_row, col=10, value=is_embroidery),
            #     Cell(row=current_row, col=11, value=embroidery_comment),
            # ])
            sheet_cells_to_update.append(
                Cell(row=current_row, col=1, value=barcode))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=2, value=product_name))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=3, value=total_quantity))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=4, value=comment))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=5, value=taken))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=6, value=price))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=7, value=not_include))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=8, value=is_printing))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=9, value=prining_comment))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=10, value=is_embroidery))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=11, value=embroidery_comment))
            sheet_cells_to_update.append(
                Cell(row=current_row, col=12, value=provider))

            # format_cell_range(order_ws, 'A' + str(current_row) +
            #                   ':K' + str(current_row), pink_header_format)
            formating_tasks.append(
                {'range': 'A' + str(current_row) + ':K' + str(current_row), 'format': PINK_HEADER_FORMAT_CONST})

            # set background colors to #00FFCCFF
            current_row += 1
            entries = order_product['entries']
            sorted_entries = sorted(
                entries.items(), key=lambda x: (x[0][3], x[0][4]))

            # if there is only one entry and it is no color and one size, don't show child table
            if len(sorted_entries) == 1 and sorted_entries[0][0][0].lower() == 'no color' and sorted_entries[0][0][1].lower() == 'one size':
                providers_data_validetions_tasks.append(
                    {'range': 'L' + str(current_row-1), })
                continue

            sorted_entries = dict(sorted_entries)
            for entry in sorted_entries:
                _color = entry[0]
                size = entry[1]
                varient = entry[2]
                quantity = sorted_entries[entry]['qyt']
                taken = sorted_entries[entry]['taken']
                if taken == '0' or taken == 0:
                    taken = ''

                provider = sorted_entries[entry]['provider']
                # order_ws.update_cells([
                #     Cell(row=current_row, col=1, value=_color),
                #     Cell(row=current_row, col=2, value=size),
                #     Cell(row=current_row, col=3, value=varient),
                #     Cell(row=current_row, col=4, value=quantity),
                # ])
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=1, value=_color))
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=2, value=size))
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=3, value=varient))
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=4, value=quantity))
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=5, value=taken))
                sheet_cells_to_update.append(
                    Cell(row=current_row, col=12, value=provider))

                # format_cell_range(order_ws, 'A' + str(current_row) + ':D' + str(current_row),
                #                   subtable_header_format)
                # formating_tasks.append(
                #     {'range': 'A' + str(current_row) + ':D' + str(current_row), 'format':  SUBTABLE_HEADER_FORMAT_CONST})
                # 5 taken
                formating_tasks.append(
                    {'range': 'E' + str(current_row) + ':E' + str(current_row), 'format':  USER_INPUT_FORMAT_CONST})

                providers_data_validetions_tasks.append(
                    {'range': 'L' + str(current_row)})
                current_row += 1
        pass
        if len(sheet_cells_to_update) > 0:
            order_ws.update_cells(sheet_cells_to_update)

        # execute_formatting_tasks:
        # @param worksheet_for_formatting: the worksheet to apply the formatting to
        # @param formating_tasks: [{'range': 'A1:B2', 'format': 'pink_header_format'/USER_INPUT_FORMAT_CONST}]
        def execute_formatting_tasks(worksheet_for_formatting, formating_tasks):
            formating_tasks_by_format = {}
            for task in formating_tasks:
                if task['format'] not in formating_tasks_by_format:
                    formating_tasks_by_format[task['format']] = []
                formating_tasks_by_format[task['format']].append(task['range'])
            full_format_list = []
            for format_key in formating_tasks_by_format:
                list_of_ranges = formating_tasks_by_format[format_key]
                # change every item in list_of_ranges to a tuple with the all_formats[format_key]
                list_of_ranges = [(range, all_formats[format_key])
                                  for range in list_of_ranges]
                full_format_list.extend(list_of_ranges)
            if len(full_format_list) > 0:
                format_cell_ranges(worksheet_for_formatting, full_format_list)
        execute_formatting_tasks(order_ws, formating_tasks)

        # set validation for providers column (L)
        # to the end of the table
        # set_data_validation_for_cell_range(
        #     order_ws, 'L' + str(starting_row) + ':L' + str(current_row), providers_validation_rule)

        # ranges: An iterable whose elements are pairs of:
        #            a string with range value in A1 notation, e.g. 'A1:A5',
        #            and a ``DataValidationRule`` object or None to clear the data
        #            validation rule).
        ranges = [(r['range'], providers_validation_rule)
                  for r in providers_data_validetions_tasks]
        if len(ranges) > 0:
            set_data_validation_for_cell_ranges(
                order_ws, ranges)

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
                # provider = entry.provider if entry.provider != None else ''
                taken = entry.sheets_taken_quantity if entry.sheets_taken_quantity != None else ''
                provider = entry.sheets_provider if entry.sheets_provider != None else ''
                key = tuple([color, size, varient, color_order, size_order])
                # entries.append([color, size,varient,entry.quantity])
                entries[key] = {
                    'qyt': entry.quantity,
                    'taken': taken,
                    'provider': provider,
                }
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
            'date': self.created.strftime('%Y_%m_%d'),
            'id': self.id,
            'status': self.status2.name if self.status2 != None else '',
            'admin_link': self.get_edit_url_without_html(base_url=FULL_DOMAIN),
            'export_to_suppliers': self.export_to_suppliers,
        }
        return data

    def view_morder_stock_document_link(self):
        link = reverse('view_morder_stock_document', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'הצג מסמך הוצאה מהמלאי'))

    def view_morder_pdf_link(self):
        link = reverse('view_morder_pdf', args=(self.pk,))
        return mark_safe('<a href="{}">{}</a>'.format(link, 'הצג הזמנה'))

    def get_edit_url_without_html(self, base_url=None):
        link = reverse('admin_edit_order', args=(self.pk,))
        if base_url:
            return base_url + link
        return link

    def get_edit_url(self, base_url=None):
        link = reverse('admin_edit_order', args=(self.pk,))
        if base_url:
            return base_url + link
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
        status = self.status2
        return status
        # STATUS_CHOICES = [('new', 'חדש'), ('price_proposal',....
        # for choice in STATUS_CHOICES:
        #     if choice[0] == status:
        #         return choice[1]

    def get_edit_order_url(self):
        return reverse('admin_edit_order', args=(self.pk,))
        # morders/edit-order/{self.pk}/
# @receiver(pre_save, sender=MOrder)
# def check_for_status_update(sender, instance, *args, **kwargs):

#     pass


class MorderStatus(OrderedModelBase):
    COLOR_PALETTE = [
        ('#FFFFFF', 'white', ),
        ('#000000', 'black', ),
        ('#FFFFFF00', 'transparent', ),
    ]
    name = models.CharField(max_length=100, unique=True,
                            verbose_name=_('name'))
    sort_order = models.PositiveIntegerField(editable=False, db_index=True)
    color = ColorField(verbose_name=_(
        'color'), default='#FF12E2FF', format='hexa', samples=COLOR_PALETTE)
    order_field_name = "sort_order"

    class Meta:
        ordering = ("sort_order",)

    def __str__(self):
        return self.name
