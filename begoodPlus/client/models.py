import io
from random import choices
import uuid
from django.db.models.fields import json
from django.http.response import FileResponse
from django.utils.safestring import mark_safe
from colorhash import ColorHash
from django.db import models
from matplotlib.colors import rgb2hex
from numpy.ma.core import prod
import xlwt
from xlwt.Style import XFStyle
from catalogImages.models import CatalogImage
from core.models import uuid2slug
from django.db.models.fields.related import OneToOneField
from django.utils.translation import gettext_lazy  as _
from django.conf import settings
import prettytable as pt
import telegram
from begoodPlus.secrects import TELEGRAM_BOT_TOKEN
from catalogAlbum.models import CatalogAlbum
from django.contrib.auth.models import User
import json
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from json2html import *
from PIL import Image
from io import BytesIO
import colorsys
from tabulate import tabulate
from begoodPlus.celery import telegram_bot

# Create your models here.
class UserLogEntry(models.Model):
    #user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,null=True, blank=True)
    #uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True,default=uuid.uuid4)
    #device = models.CharField(verbose_name=_('device'), max_length=100, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra = models.JSONField(default=dict)
    def __str__(self) -> str:
        return self.action
    
    def admin_description(self):
        data =  json2html.convert(json=json.loads(self.extra))
        return str(self.id) + ')\t \t' + self.timestamp.strftime("%H:%M:%S.%f")[:-3] + "\t - \t" + self.action + "\t - \t" + data
        #newExtra = self.extra
        #del newExtra['a']
        #del newExtra['timestemp']
        #return self.timestamp.strftime("%d/%m/%Y, %H:%M:%S.%f")[:-3] + ' || ' + self.action + ' || ' + str(self.extra)

    
class UserSessionLogger(models.Model):
    user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,null=True, blank=True)
    #uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True,default=uuid.uuid4)
    uid = models.CharField(verbose_name=_('uuid'),max_length=150, null=True, blank=True,default=uuid.uuid4)
    device = models.CharField(verbose_name=_('device'), max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    session_start_timestemp = models.DateTimeField(auto_now_add=True)
    session_end_timestemp = models.DateTimeField(null=True, blank=True)
    logs = models.ManyToManyField(to=UserLogEntry,blank=True, related_name='logs')
    def uniqe_color(self):
        ret = f'<span width="25px" height="25px" style="color:black;background-color: {ColorHash(str(self.uid)).hex}">{uuid2slug(self.uid)}</span>'
        return mark_safe(ret)

    
    def session_duration(self):
        if self.session_end_timestemp:
            return str(self.session_end_timestemp - self.session_start_timestemp)[:-3]
        else:
            return '-'
    session_duration.short_description = _('session duration')
    
    def generate_telegram_message(self):
        # UserSessionLogger.objects.first().generate_telegram_message()
        data = self.analyze_user_session()
        #main_table = pt.PrettyTable([])
        #user_table = pt.PrettyTable([])
        #user_table.add_row(['שם משתמש', data['user']['username']])
        #user_table.add_row(['שם העסק', data['user']['business_name']])
        #user_table.add_row(['IP', data['user']['device']])
        message = '==========\r\n\r\n\r\n=========='
        message += '<b>תאריך:</b> ' + data['session']['t_start'].strftime("%d/%m/%Y, %H:%M:%S") + '\r\n'
        message += '<b>זמן באתר:</b> ' + data['session']['duration'] + '\r\n'
        #message += '\r\n'
        
        message += '<b>שם משתמש: </b> ' + data['user']['username'] + '\r\n'
        message += '<b>שם עסק: </b> ' + data['user']['business_name'] + '\r\n'
        #message += '\r\n'
        
        message += '<b> כתובת:</b> ' + data['user']['device'] + '\r\n'
        message += '<b>כמות פעולות:</b> ' + str(data['session']['logs_count']) + '\r\n'
        cart = data['last_cart']
        message += '\r\n'
        
        
        #cartTable = pt.PrettyTable(['עגלה שלא נשלחה'])
        if(cart != None and len(cart) > 0):
            message += '<b>עגלה שלא נשלחה:</b>' + '\r\n'
            cart_len = len(cart)
            message += '<b>כמות פריטים:</b>' + str(cart_len) + '\r\n'
            for id in cart:
                product = cart[id]
                #cartTable.add_row([product['ti']])
                message += product['ti'] + '\r\n'
        else:
            message += 'אין עגלה שלא נשלחה'

        message += '\r\n\r\n\r\n'
        
        sum_products_watch_time = {}
        logs = data['session']['logs']
        for idx, logStr  in enumerate(logs):
            try:
                
                #log_data = json.loads(logStr['data'])
                log_data = logStr['data']
                if log_data['t'] == 'open product':
                    if(idx < logs.__len__() - 1 and idx > 0):
                        last_log_data = logs[idx-1]['data']
                        s_time = datetime.strptime(last_log_data['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        e_time = datetime.strptime(log_data['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        duration = e_time - s_time#logs[idx+1]['data']['timestemp'] - 
                        product_id = log_data['w']['id']
                        if product_id in sum_products_watch_time:
                            sum_products_watch_time[product_id] += duration
                        else:
                            sum_products_watch_time[product_id] = duration
            except:
                pass
        #ret += f'<code>{cartTable}</code>'
        
        #sumTable = pt.PrettyTable(['שם המוצר','זמן','קטגוריה'])
        #sumTable.align = 'l'
        #sumTable.align['זמן'] = 'c'
        chart_data = []
        for id in sum_products_watch_time:
            ducation = sum_products_watch_time[id]
            product = CatalogImage.objects.get(id=id)
            
            #sumTable.add_row([product.title[0:15], str(ducation)[:-3], product.albums.first().title])
            chart_data.append({'name':product.title, 'value':ducation.total_seconds(), 'category':product.albums.first().title})
        #tableStr = str(sumTable)
        #tableStr = tableStr.replace('---+', '---+ת')
        
        #ret += f'<code>{tableStr}</code>'
        chart = self.get_pie_cart(chart_data)
        
        user_story = self.get_user_story(data['session']['logs'])
        message += 'סיפור משתמש: \r\n' + user_story
        # 
        message += '\r\n==========\r\n==========\r\n'
        ret = {
            'message': message,
            'chart': chart,
        }
        return ret
    
    def get_sum_products_watch_time(self,data):
        sum_products_watch_time = {}
        logs = data['session']['logs']
        for idx, logStr  in enumerate(logs):
            try:
                
                #log_data = json.loads(logStr['data'])
                log_data = logStr['data']
                if log_data['t'] == 'open product':
                    if(idx < logs.__len__() - 1 and idx > 0):
                        last_log_data = logs[idx-1]['data']
                        s_time = datetime.strptime(last_log_data['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        e_time = datetime.strptime(log_data['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        duration = e_time - s_time#logs[idx+1]['data']['timestemp'] - 
                        product_id = log_data['w']['id']
                        if product_id in sum_products_watch_time:
                            sum_products_watch_time[product_id] += duration
                        else:
                            sum_products_watch_time[product_id] = duration
            except:
                pass
        return sum_products_watch_time
    
    def get_pie_cart(self,data):
        if(len(data) == 0):
            return None
        df = pd.DataFrame(data)
        from bidi.algorithm import get_display
        import arabic_reshaper
        #plt.figure(figsize=(19,14))
        plt.figure(figsize=(12,12))
        # nested pie chart of the product's categories, value and name:
        
        names = df.iloc[:,0]
        categories = df.iloc[:,2]
        heb_names = []
        heb_categories = []
        category_sums = []
        
        main_colors = [colorsys.hls_to_rgb(h, 0.5, 1) for h in np.linspace(0, 1, len(categories))]
        main_colors_hex = [rgb2hex(color) for color in main_colors]
        
        
        #hex_clr = rgbToHex(int(clr[0]*255), int(clr[1]*255), int(clr[2]*255))
        #colors = ['gold', 'lightskyblue', 'lightcoral', 'red', 'blue', 'green', 'orange', 'pink', 'purple', 'brown', 'grey', 'olive', 'teal', 'navy', 'maroon', 'lime', 'fuchsia', 'tan', 'aqua', 'silver', 'indigo', 'violet', 'black', 'white']
        
        for n in names:
            reshaped_text = arabic_reshaper.reshape(n)
            artext = get_display(reshaped_text)
            heb_names.append(artext)
        for c in categories:
            reshaped_text = arabic_reshaper.reshape(c)
            artext = get_display(reshaped_text)
            heb_categories.append(artext)
        df['heb_names'] = heb_names
        df['heb_categories'] = heb_categories
        gb_categories = df.groupby('heb_categories')
        outer_colors = []
        for i, (name, group) in enumerate(gb_categories):
            print(name)
            print(group)
            products_n_in_category = len(group.value)
            # generate lighter colors based on the main colors * the number of products in the category
            base_category_color = main_colors[i]
            cat_hsl = colorsys.rgb_to_hls(*base_category_color)
            category_colors = [colorsys.hls_to_rgb(cat_hsl[0], cat_hsl[1],h) for h in np.linspace(0.5, 1, products_n_in_category)]
            outer_colors.extend(category_colors)
        outer_colors_hex = [rgb2hex(color) for color in outer_colors]
        #df['category_prc'] = df['value'].sum()/df['value'].sum()
        def inner_pie_display(pct, df):
            v = df.groupby('heb_categories',sort=False)['value'].sum()
            names = df.groupby('heb_categories',sort=False)['heb_categories']
            cat_sum = v.sum()
            for i in range(len(v)):
                if abs(v[i]/cat_sum*100 - pct)<0.05:
                    return list(names.indices.keys())[i] + '\n' + \
                            ' (' + str(df.groupby('heb_categories',sort=False).groups[list(df.groupby('heb_categories',sort=False).groups.keys())[i]].values.size) + ')\n' + \
                            "{:.1f}%".format(pct)
        # iterate the df and extract heb_categories and value
        #heb_labels = df.UserSessionLogger.objects.get(id=85).send_telegram_message()roupby('heb_categories',sort=False)['heb_categories']
        
        #explode1 = [0.1 for i in range(len(df))]
        border = 0.1
        #explode2 = [0.2 for i in range(len(df.groupby('heb_categories',sort=False)['value'].sum()))]
        # filter from df values lover then 0.1% of the total sum
        #df = df[df.value > 0.1]
        wedgeprops={"edgecolor":"k",'linewidth': 0.2, 'linestyle': 'solid', 'antialiased': True}
        product_patches = plt.pie(df['value'],wedgeprops=wedgeprops,labels=df.iloc[:,3],colors=outer_colors_hex, autopct='%1.1f%%', shadow=False, startangle=90, radius=1.5)
        #inner pie chart of the product's categories: df.groupby('heb_categories',sort=False)['heb_categories'],
        wedgeprops={"edgecolor":"k",'linewidth': 0.5, 'linestyle': 'solid', 'antialiased': True}
        category_patches = plt.pie(df.groupby('heb_categories',sort=False)['value'].sum(),wedgeprops=wedgeprops,colors=main_colors_hex, autopct=lambda pct: inner_pie_display(pct, df), shadow=False, startangle=90, radius=0.75)
        #plt.legend(loc='0', bbox_to_anchor=(1.5, 0.5), fontsize=20)
        # product_labels the text of the slices and the % of each slice
        #for i, p in enumerate(product_patches):
            # product labels = iloc[:,3] and the % of each slice = df.value
        product_precents = df.value / df.value.sum() * 100
        
        # product labels = iloc[:,3] and the % of each slice = product_precents and the value of each slice = df.value:
        product_labels = [str(df.iloc[:,3][i]) + " - " + str(df.value[i]) + "s " + " ({:.1f}%)".format(product_precents[i]) for i in range(len(df.iloc[:,3]))]
        
        MAX_PER_COL = 15
        ncols = 1
        if len(product_labels) > MAX_PER_COL:
            ncols = int(len(product_labels)/MAX_PER_COL) + 1
        
        # order product_labels by the value of the slices
        product_labels = [product_labels[i] for i in np.argsort(df.value)[::-1]]
        plt.legend(product_labels, loc='best', bbox_to_anchor=(0, 0), ncol=ncols)
        plt.tight_layout()
        #plt.show()
        return plt
    def get_user_story(self, logs):
        ret = []
        last_timestemp = logs[0]['timestemp']
        for idx,log in enumerate(logs):
            log_entry = ''
            log_entry += '<b>' + str(idx + 1) + ') ' 
            data = log['data']
            time_from_last_log = log['timestemp'] - last_timestemp
            # log_entry += time from last log in format: '{:.2f}'.format(time_from_last_log)
            log_entry += '({:.5f}) </b>'.format(time_from_last_log.total_seconds())
            try:
                if data['t'] == 's':
                    from_id = data['f']['id']
                    to_id = data['w']['id']
                    from_obj = CatalogImage.objects.get(id=from_id)
                    to_obj = CatalogImage.objects.get(id=to_id)
                    msg = 'גלילה מ ' + \
                        '<b> ' + from_obj.title + ' </b>' + \
                        ' ל' + \
                        '<b> ' + to_obj.title + ' </b>'
                    
                elif data['t'] == 'open product':
                    msg = data['a']
                    msg += ' <b> ' + data['f']['ti'] + ' </b> '
                    msg += '> <b> ' + data['w']['ti'] + ' </b> '
                    
                elif data['t'] == 'open category':
                    if data['f']['type'] == 'navbar':
                        msg = 'פתיחת קטגוריה מנאבר'
                        msg += '<b>' + data['w']['ti'] + ' </b>'
                elif data['t'] == 'add to cart':
                    msg = data['a']
                    msg += ' <b> ' + data['f']['ti'] + ' </b> '
                    msg += '> <b> ' + data['w']['ti'] + ' </b> '
                elif data['t'] == 'submit order':
                    
                    # 'timestemp':'2021-12-12T23:09:36.016Z'
                    # 'w':{'type': 'order', 'data': {'name': 'roni Segal', 'email': 'ronionsegal@gmail.com', 'phone': '', 'uuid': '79f441ed-6c3b-443a-8...3df75738aa', 'products': [...]}}
                    # 'f':{'type': 'cart'}
                    # 't':'submit order'
                    # 'a':'שליחת הזמנה'
                    msg += data['a'] + ' ' + json.dumps(data['w']['data'])
                else:
                    print(data)
                    msg = 'לא ידוע'
                log_entry += msg
            except:
                #log_entry += 'לא קריא: ' + str(data)
                log_entry += 'שגיאה בקריאת הנתונים'
                
            ret.append(log_entry)
            last_timestemp = log['timestemp']
        return '\n\r'.join(ret)
        
    def send_telegram_message(self):
        def fig2img(fig):
            """Convert a Matplotlib figure to a PIL Image and return it"""
            import io
            buf = io.BytesIO()
            fig.savefig(buf, format='jpg',dpi=100, bbox_inches='tight', pad_inches=1)
            buf.seek(0)
            return buf
        # UserSessionLogger.objects.get(id=85).send_telegram_message()
        #for chat_id in self.chat_ids:
        messageObj = self.generate_telegram_message()
        chat_id = '-666095377'
        if(messageObj['chart']):
            buff = fig2img(messageObj['chart'])
            print(telegram_bot.send_document(chat_id=chat_id, document=buff, parse_mode='HTML'))
            #print(bot.send_message(chat_id=chat_id, text=messageObj['message'], parse_mode='HTML'))
        #else:
            #print(bot.send_message(chat_id=chat_id, text=messageObj['message'], parse_mode='HTML'))
        info = messageObj['message']
        if len(info) > 4096:
            for x in range(0, len(info), 4096):
                telegram_bot.send_message(chat_id, info[x:x+4096], parse_mode='HTML')
        else:
            telegram_bot.send_message(chat_id, info, parse_mode='HTML')
        #print(bot.send_message(chat_id=chat_id, text=messageObj['message'], parse_mode='HTML'))
    
    def generate_user_liked_products(self):
        data = self.analyze_user_session()
        sum_products_watch_time = self.get_sum_products_watch_time(data)
        
        watch_duration = []
        for id in sum_products_watch_time:
            ducation = sum_products_watch_time[id]
            product = CatalogImage.objects.get(id=id)
            watch_duration.append({'id':id, 'title':product.title, 'duration':ducation})
        
        CHANCE_ADD_TO_CART = 100
        CHANCE_PRODUCT_VIEW = 1
        cart_products = []
        for cart_product in data['all_add_to_cart']:
            cart_products.append({'id': cart_product, 'title': data['all_add_to_cart'][cart_product]['ti']})
        
        
        watch_products = []
        return {
            'cart': cart_products,
            'watch': pd.DataFrame(watch_duration)
        }
        '''
        if len(watch_duration) != 0:
            df = pd.DataFrame(watch_duration)
            df['total'] = df.duration / df.duration.sum() * 100
        
        
            df = df.sort_values(by=['total'], ascending=False)
            for index, row in df.iterrows():
                product = row
                watch_products.append({'id': product.id, 'chance': "{:.2f}".format(CHANCE_PRODUCT_VIEW * product.total)})
        
        '''
        
        ### send products as telegram message:
        
        
    def analyze_user_session(self):
        # UserSessionLogger.objects.first().analyze_user_session()
        username = None
        business_name = None
        if self.user and not self.user.is_anonymous:
            username = self.user.username
            business_name = self.user.client.businessName
        if username is None:
            username = '-'
            business_name = '-'
        ret = {
            'user': {
                'username': username,
                'business_name': business_name,
                'uid': self.uid,
                'device': self.device,
            },
            'session': {
                'id': self.id,
                't_start': self.session_start_timestemp,
                't_end': self.session_end_timestemp,
                'duration': self.session_duration(),
                'logs_count': self.logs.count(),
                'logs': [],
            }
        }
        cart = {}
        all_cart = {}
        for log in self.logs.all():
            log_data = json.loads(log.extra)
            ret['session']['logs'].append({
                'id': log.id,
                'data': log_data,
                'timestemp': log.timestamp,
            })
            try:
                if(log_data['t'] == 'add to cart'):
                    cart[log_data['w']['id']] = log_data['w']
                    all_cart[log_data['w']['id']] = log_data['w']
                if(log_data['t'] == 'remove from cart'):
                    del cart[log_data['w']['id']]
                    
                if(log_data['t'] ==  'submit order'):
                    cart = {}
            except Exception as e:
                print(e)
                pass
        
        
        ret['all_add_to_cart'] = all_cart
        ret['last_cart'] = cart
        return ret
    
    def admin_display_logs(self):
        ret ='<div style="border:1px solid black"><ul>' +  '<li style="border-top:1px solid blue;">'.join([str(log.admin_description())+'</li>' for log in self.logs.all()])
        ret += '</ul></div>'
        return mark_safe(ret)
        
    
    def get_logs(self):
        return self.logs.all()




class ClientType(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=120)
    
    def __str__(self):
        return self.name

class ClientOrganizations(models.Model):
    name= models.CharField(verbose_name=_('name'), max_length=255)
    def __str__(self):
        return self.name
    
class PaymantWay(models.Model):
    name=models.CharField(verbose_name=_('name'), max_length=100)
    def __str__(self):
        return self.name

class PaymentTime(models.Model):
    name = models.CharField(verbose_name=_('name'), max_length=100)
    def __str__(self):
        return self.name

CLIENT_TYPE_ND = 'ND'
CLIENT_TYPE_PR = 'PR'
CLIENT_TYPE_KB = 'KB'
CLIENT_TYPES_DICT = {
    CLIENT_TYPE_ND: 'לא מוגדר',
    CLIENT_TYPE_PR: 'פרטי',
    CLIENT_TYPE_KB: 'קיבוץ',
}
from model_utils import Choices
CLIENT_TYPES = [
    (CLIENT_TYPE_ND, CLIENT_TYPES_DICT[CLIENT_TYPE_ND]),
    (CLIENT_TYPE_PR, CLIENT_TYPES_DICT[CLIENT_TYPE_PR]),
    (CLIENT_TYPE_KB, CLIENT_TYPES_DICT[CLIENT_TYPE_KB]),
    ]
class Client(models.Model):
    # שדה תאריך ושעה של יצירת החשבון במערכת
    created_at = models.DateTimeField(auto_now_add=True)
    #CLIENT_TYPE = Choices((0, 'not_defined', _('not defined')), (1, 'private', _('private')), (2, 'kibuttz', _('kibuttz')))
    
    user = OneToOneField(to=User,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_('user'))
    def __str__(self):
        try:
            #mtype = str(self.CLIENT_TYPE._display_map.get(int(self.clientType)))
            pass
        except:
            pass
        if self.clientType == None:
            self.clientType = CLIENT_TYPE_ND
        mtype = CLIENT_TYPES_DICT.get(self.clientType)
        
        ret = self.businessName + ' - ' + str(mtype)
        return ret
    businessName = models.CharField(verbose_name=_('business name '), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    extraName = models.CharField(verbose_name=_('extra name'), max_length=120, null=True,blank=True)
    storeType = models.ForeignKey( verbose_name=_('store type'), to=ClientType,on_delete=models.SET_NULL, null=True)
    categorys = models.ManyToManyField(verbose_name=_('categories'), to=CatalogAlbum, blank=True)
    tariff = models.SmallIntegerField(verbose_name=_('tariff (%)'), default=0)
    privateCompany = models.CharField(max_length=254, verbose_name=_('P.C.'))
    clientType = models.CharField(max_length=50, choices=CLIENT_TYPES, verbose_name=_('client type'), default=CLIENT_TYPE_ND)
    address = models.CharField(verbose_name=_('address'), max_length=511)
    contactMan = models.CharField(verbose_name=_('contact man'),max_length=100)
    contactManPosition = models.CharField(verbose_name=_('contact man position'), max_length=100)
    contactManPhone = models.CharField(verbose_name=_('contact man phone'),max_length=100)
    contactMan2 = models.CharField(verbose_name=_('contact man 2'),max_length=100, blank=True, null=True)
    contactMan2Phone = models.CharField(verbose_name=_('contact man 2 phone'),max_length=100, blank=True, null=True)
    officePhone = models.CharField(verbose_name=_('office phone'), max_length=100, blank=True, null=True)
    extraMail = models.EmailField(verbose_name=_('extra email'), max_length=100, blank=True, null=True)
    organization = models.ForeignKey(verbose_name=_('organization'),  to=ClientOrganizations, on_delete=models.SET_NULL, null=True,blank=True)
    howPay = models.ForeignKey(verbose_name=_('payment way'), to=PaymantWay, on_delete=models.PROTECT, null=True,blank=True)
    whenPay = models.ForeignKey(verbose_name=_('payment time'), to=PaymentTime, on_delete=models.PROTECT, null=True,blank=True)
    isWithholdingTax = models.BooleanField(verbose_name=_('IsWithholdingTax'), default=False)
    #availabilityHours = models.TextField(verbose_name=_('availability hours'), blank=True)
    #availabilityDays = models.TextField(verbose_name=_('availability days'), blank=True)
    
    sunday = models.CharField(verbose_name=_('sunday'), max_length=100, blank=True, null=True)
    monday = models.CharField(verbose_name=_('monday'), max_length=100, blank=True, null=True)
    tuesday = models.CharField(verbose_name=_('tuesday'), max_length=100, blank=True, null=True)
    wednesday = models.CharField(verbose_name=_('wednesday'), max_length=100, blank=True, null=True)
    thursday = models.CharField(verbose_name=_('thursday'), max_length=100, blank=True, null=True)
    friday = models.CharField(verbose_name=_('friday'), max_length=100, blank=True, null=True)
    saturday = models.CharField(verbose_name=_('saturday'), max_length=100, blank=True, null=True)
    
    comment = models.TextField(verbose_name=_('comments'), blank=True, null=True)
    

    
    def generate_user_products_from_sessions(self):
        sessions = UserSessionLogger.objects.filter(user=self.user)
        uids = [session.uid for session in sessions]
        # remove duplicates from uids
        uids = list(set(uids))
        sessions = UserSessionLogger.objects.filter(uid__in=uids)
        cart_products = []
        product_duration = pd.DataFrame()
        info = {
            'user': self.user,
            'sessions_count': len(sessions),
            'sessions': [{'id': session.id, 'start': session.session_start_timestemp, 'end':session.session_end_timestemp, 'logs': session.logs.count()} for session in sessions],
        }
        for session in sessions:
            temp = session.generate_user_liked_products()
            cart_products.extend(temp['cart'])
            product_duration = product_duration.append(temp['watch'])
        info['cart_products'] = cart_products
        # remove from product_duration dataFrame rows with duration < MIN_DUR secound and duration > MAX_DUR
        MIN_DUR = timedelta(seconds=1)
        MAX_DUR = timedelta(minutes=30)
        max_time = MIN_DUR
        if(product_duration.shape[0] == 0):
            product_duration['duration'] = MAX_DUR-MIN_DUR
        else:
            product_duration = product_duration[product_duration.duration > MIN_DUR]
            product_duration = product_duration[product_duration.duration < MAX_DUR]
            #product_duration = product_duration[product_duration.duration != np.NaN]
            max_time = product_duration.max().duration
            if pd.isnull(max_time):
                max_time = MIN_DUR
        cart_df = pd.DataFrame(cart_products)
        # add max_time to every row of cart_df
        cart_df['duration'] = max_time
        product_duration = product_duration.append(cart_df)
        product_duration = product_duration.dropna()
        if product_duration.empty:
            return None
        # sum duration of each product based on col id
        
        #v = tabulate(df, headers='keys', tablefmt='psql')
        #print(v)
        #product_duration = product_duration.groupby(['title'])
        print(product_duration.head())
        product_duration = product_duration.groupby('id')['duration'].agg('sum').reset_index()
        max_time = product_duration.duration.max()
        #print(tabulate(df, headers='keys', tablefmt='psql'))
        print(product_duration.head())
        sum = product_duration.duration.sum() * 100
        if sum == 0:
            sum = 1
        print('max_time: ' + str(max_time))
        product_duration['prc'] = product_duration.duration / sum
        product_duration['prc2'] = product_duration.duration / max_time
        product_duration['duration'] = product_duration['duration'].apply(lambda x: x.total_seconds())
        #print(product_duration.head())
        #print(info)
        # sort product_duration by prc
        product_duration = product_duration.sort_values(by='prc', ascending=False)
        print('==============================', 'product duration')
        print(product_duration.head())
        print('==============================', 'product duration')
        
        buffer = self.export_dataframe_to_excel(product_duration)
        return buffer
    
    def export_dataframe_to_excel(self, df):
        buffer = io.BytesIO()
        wb = xlwt.Workbook()
        ws = wb.add_sheet('sheet1',cell_overwrite_ok=True)
        ws.cols_right_to_left = True
        title_style = XFStyle()
        alignment_center = xlwt.Alignment()
        alignment_center.horz = xlwt.Alignment.HORZ_CENTER
        alignment_center.vert = xlwt.Alignment.VERT_CENTER
        title_style.alignment = alignment_center
        
        title_style.font.bold = True
        
        for header in df.columns:
            ws.write(0, df.columns.get_loc(header), header, title_style)
        
        
        inc_row = 0
        for row_num, row in df.iterrows():
            #i = 0
            for header in df.columns:
                col_loc = df.columns.get_loc(header)
                ws.write(inc_row+1,col_loc , row[header], title_style)
                #i+=1
            #ws.write(inc_row+1, 0, row['id'], title_style)
            #ws.write(inc_row+1, 1, row['title'], title_style)
            #ws.write(inc_row+1, 2, row['duration'].total_seconds(), title_style)
            #ws.write(inc_row+1, 3, row['prc'], title_style)
            #ws.write(inc_row+1, 4, row['prc2'], title_style)
            inc_row += 1
        wb.save(buffer)
        buffer.seek(0)
        return buffer