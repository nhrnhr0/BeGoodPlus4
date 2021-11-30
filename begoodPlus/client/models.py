import uuid
from django.db.models.fields import json
from django.utils.safestring import mark_safe
from colorhash import ColorHash
from django.db import models
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
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
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
        return str(self.id) + ')\t \t' + self.timestamp.strftime("%H:%M:%S.%f")[:-3] + "\t - \t" + self.action
        #newExtra = self.extra
        #del newExtra['a']
        #del newExtra['timestemp']
        #return self.timestamp.strftime("%d/%m/%Y, %H:%M:%S.%f")[:-3] + ' || ' + self.action + ' || ' + str(self.extra)
    

    
class UserSessionLogger(models.Model):
    user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,null=True, blank=True)
    uid = models.UUIDField(verbose_name=_('uuid'), null=True, blank=True,default=uuid.uuid4)
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
        main_table = pt.PrettyTable([])
        #user_table = pt.PrettyTable([])
        #user_table.add_row(['שם משתמש', data['user']['username']])
        #user_table.add_row(['שם העסק', data['user']['business_name']])
        #user_table.add_row(['IP', data['user']['device']])
        ret = '\r\n\r\n\r\n'
        ret += '<b>תאריך:</b> ' + data['session']['t_start'].strftime("%d/%m/%Y, %H:%M:%S") + '\r\n'
        ret += '<b>זמן באתר:</b> ' + data['session']['duration'] + '\r\n'
        ret += '\r\n'
        
        ret += '<b>שם משתמש: </b> ' + data['user']['username'] + '\r\n'
        ret += '<b>שם עסק: </b> ' + data['user']['business_name'] + '\r\n'
        ret += '\r\n'
        
        ret += '<b> כתובת:</b> ' + data['user']['device'] + '\r\n'
        ret += '<b>כמות פעולות:</b> ' + str(data['session']['logs_count']) + '\r\n'
        cart = data['last_cart']
        ret += '\r\n'
        
        
        #cartTable = pt.PrettyTable(['עגלה שלא נשלחה'])
        if(cart != None and len(cart) > 0):
            ret += '<b>עגלה שלא נשלחה:</b>' + '\r\n'
            ret += '<b>כמות פריטים:</b>' + str(cart.items.count()) + '\r\n'
            for id in cart:
                product = cart[id]
                #cartTable.add_row([product['ti']])
                ret += product['ti'] + '\r\n'
        else:
            ret += 'אין עגלה שלא נשלחה'

        ret += '\r\n\r\n\r\n'
        
        sum_products_watch_time = {}
        logs = data['session']['logs']
        for idx, log  in enumerate(logs):
            try:
                if log['data']['t'] == 'open product':
                    if(idx < logs.__len__() - 1):
                        s_time = datetime.strptime(logs[idx+1]['data']['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        e_time = datetime.strptime(log['data']['timestemp'],'%Y-%m-%dT%H:%M:%S.%fZ')
                        duration = s_time-e_time#logs[idx+1]['data']['timestemp'] - 
                        product_id = log['data']['w']['id']
                        if product_id in sum_products_watch_time:
                            sum_products_watch_time[product_id] += duration
                        else:
                            sum_products_watch_time[product_id] = duration
            except:
                pass
        #ret += f'<code>{cartTable}</code>'
        
        sumTable = pt.PrettyTable(['שם המוצר','זמן','קטגוריה'])
        sumTable.align = 'l'
        sumTable.align['זמן'] = 'c'
        chart_data = []
        for id in sum_products_watch_time:
            ducation = sum_products_watch_time[id]
            product = CatalogImage.objects.get(id=id)
            
            sumTable.add_row([product.title[0:15], str(ducation)[:-3], product.albums.first().title])
            chart_data.append({'name':product.title, 'value':ducation.total_seconds(), 'category':product.albums.first().title})
        tableStr = str(sumTable)
        tableStr = tableStr.replace('---+', '---+ת')
        
        ret += 'התעניינויות:' + "\r\n"
        ret += f'<code>{tableStr}</code>'
        chart = self.get_pie_cart(chart_data)
        
        
        
        return ret
    def get_pie_cart(self,data):
        df = pd.DataFrame(data)
        from bidi.algorithm import get_display
        import arabic_reshaper
        print(df.head())
        plt.figure(figsize=(19,14))
        # nested pie chart of the product's categories, value and name:
        
        names = df.iloc[:,0]
        categories = df.iloc[:,2]
        heb_names = []
        heb_categories = []
        category_sums = []
        colors = ['yellowgreen', 'gold', 'lightskyblue', 'lightcoral', 'red', 'blue', 'green', 'orange', 'pink', 'purple', 'brown', 'grey', 'olive', 'teal', 'navy', 'maroon', 'lime', 'fuchsia', 'tan', 'aqua', 'silver', 'indigo', 'violet', 'black', 'white']
        
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
        plt.pie(df['value'], labels=df.iloc[:,3],colors=colors, autopct='%1.1f%%', shadow=False, startangle=90, radius=1)
        #inner pie chart of the product's categories:
        plt.pie(df['value'], labels=df.iloc[:,4], colors=colors, autopct='%1.1f%%', shadow=False, startangle=90, radius=0.75)
        #plt.legend(loc='0', bbox_to_anchor=(1.5, 0.5), fontsize=20)
        plt.show()
        
        plt.title('התעניינות במוצרים')
        plt.tight_layout()
        return plt
    def send_telegram_message(self):
        # UserSessionLogger.objects.get(id=85).send_telegram_message()
        bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)
        #for chat_id in self.chat_ids:
        message = self.generate_telegram_message()
        chat_id = '354783543'
        print(bot.send_message(chat_id=chat_id, text=message, parse_mode='HTML'))
    
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
            ret['session']['logs'].append({
                'id': log.id,
                'data': log.extra,
                'timestemp': log.timestamp,
            })
            try:
                if(log.extra['t'] == 'add to cart'):
                    cart[log.extra['w']['id']] = log.extra['w']
                    all_cart[log.extra['w']['id']] = log.extra['w']
                if(log.extra['t'] == 'remove from cart'):
                    del cart[log.extra['w']['id']]
                    
                if(log.extra['t'] ==  'submit order'):
                    cart = {}
            except Exception as e:
                print(e)
                pass
        
        print(cart)
        
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


class Client(models.Model):
    # שדה תאריך ושעה של יצירת החשבון במערכת
    created_at = models.DateTimeField(auto_now_add=True)
    
    user = OneToOneField(to=User,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_('user'))
    businessName = models.CharField(verbose_name=_('business name '), max_length=120)
    email = models.EmailField(verbose_name=_('email'), max_length=120)
    extraName = models.CharField(verbose_name=_('extra name'), max_length=120, null=True,blank=True)
    storeType = models.ForeignKey( verbose_name=_('store type'), to=ClientType,on_delete=models.SET_NULL, null=True)
    categorys = models.ManyToManyField(verbose_name=_('categories'), to=CatalogAlbum, blank=True)
    tariff = models.SmallIntegerField(verbose_name=_('tariff (%)'), default=0)
    privateCompany = models.CharField(max_length=254, verbose_name=_('P.C.'))
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
    
