from __future__ import absolute_import, unicode_literals
import email

from begoodPlus.celery import app

from celery import shared_task


import time

from client.models import UserQuestion, UserSessionLogger
from core.models import SvelteCartModal, SvelteContactFormModal, UserProductPhoto


@shared_task
def test(a,b):
    print('hey')
    time.sleep(5)
    return a+b
import datetime
from django.utils import timezone
@shared_task
def close_inactive_user_sessions():
    print('=================== close_inactive_user_sessions is running ==========================')
    active_sessions = UserSessionLogger.objects.filter(is_active=True)
    ret = []
    for session in active_sessions:
        last_log = session.logs.last()
        # set session_expiry_time to 5 minutes
        session_expiry_time = datetime.timedelta(hours=1)
        now = timezone.now()
        if last_log.timestamp < now - session_expiry_time:
            session.is_active = False
            session.session_end_timestemp = last_log.timestamp
            session.save()
            ret.append({session, True})
            try:
                session.send_telegram_message()
            except:
                pass
        else:
            ret.append({session, False})
    return ret

from django.template.loader import render_to_string
from django.core import mail
from django.utils.html import strip_tags
from django.conf import settings
from begoodPlus.secrects import TELEGRAM_CHAT_ID_CARTS, MAIN_EMAIL_RECEIVER, TELEGRAM_CHAT_ID_LEADS, TELEGRAM_CHAT_ID_PRODUCT_PHOTO, TELEGRAM_CHAT_ID_QUESTIONS
import telegram
from begoodPlus.celery import telegram_bot
@shared_task
def send_cantacts_notificatios(contacts_id):
    contact_info = SvelteContactFormModal.objects.get(id=contacts_id)
    info = {
        'user': contact_info.user,
        'device': contact_info.device,
        'uid': contact_info.uid,
        'name': contact_info.name,
        'phone': contact_info.phone,
        'email': contact_info.email,
        'message': contact_info.message,
        'created_date': contact_info.created_date
    }
    chat_id = TELEGRAM_CHAT_ID_LEADS
    text = 'טופס לידים בתחתית הדף הוגש'
    text += '\n'
    text += '<b> שם: </b> {name}'.format(**info)
    text += '\n'
    text += '<b> טלפון: </b> {phone}'.format(**info)
    text += '\n'
    text += '<b> אימייל: </b> {email}'.format(**info)
    text += '\n'
    text += '<b> הודעה: </b> {message}'.format(**info)
    text += '\n'
    text += '<b> תאריך יצירת הטופס: </b> {created_date}'.format(**info)
    text += '\n'
    text += '<b> מזהה משתמש: </b> {uid}'.format(**info)
    text += '\n'
    text += '<b> מכשיר: </b> {device}'.format(**info)
    subject = 'טופס לידים בתחתית הדף הוגש'
    from_email = 'טופס לידים בתחתית הדף <Main@ms-global.co.il>'
    to = MAIN_EMAIL_RECEIVER
    html_text = text.replace('\n', '<br>')
    mail.send_mail(subject, text, from_email, [to], html_message=html_text)
    telegram_bot.send_message(chat_id=chat_id, text=text, parse_mode=telegram.ParseMode.HTML)
@shared_task
def product_photo_send_notification(user_product_photo):
    obj = UserProductPhoto.objects.get(id=user_product_photo)
    chat_id = TELEGRAM_CHAT_ID_PRODUCT_PHOTO
    image = obj.photo.url
    caption = '<b> משתמש: </b> ' + str(obj.user) + '\n<b> הודעה: </b> ' + obj.description + '\n<b> מחיר קנייה: </b> '+str(obj.buy_price)+'\n<b> מחיר רצוי: </b> '+ str(obj.want_price) +' '
    try:
        if image:
            telegram_bot.send_photo(chat_id, image, caption=caption, parse_mode=telegram.ParseMode.HTML)
        else:
            telegram_bot.send_message(chat_id, caption, parse_mode=telegram.ParseMode.HTML)
    except:
        pass
    try:
        email_html = caption.replace('\n', '<br>')
        email_text = strip_tags(email_html)
        if image:
            email_html += '<img src="'+image+'" width="100%">'
        subject = 'משתמש רוצה את המוצר הזה באתר' + str(obj.id)
        from_email = 'מוצר רצוי <Main@ms-global.co.il>'
        to = MAIN_EMAIL_RECEIVER
        mail.send_mail(subject, email_text, from_email, [to], html_message=email_html)
    except:
        pass
    
@shared_task
def send_question_notification(question_id):
    obj = UserQuestion.objects.get(id=question_id)
    info = {
        'product': obj.product,
        'question': obj.question,
        'user': obj.user,
        'created_at': obj.created_at,
        'ip':   obj.ip,
    }
    chat_id = TELEGRAM_CHAT_ID_QUESTIONS
    text = 'שאלה חדשה\nנשלחה על ידי <b> {user} </b> בעזרת האתר שלנו בכתובת <b> {ip} </b> בתאריך <b> {created_at} </b> עבור המוצר <b> {product} </b>'.format(**info)
    text += '\n\n{question}'.format(**info)
    try:
        telegram_bot.send_message(chat_id=chat_id, text=text, parse_mode=telegram.ParseMode.HTML)
    except:
        pass
    
    subject = 'שאלה חדשה נשלחה על ידי ' + str(obj.user) + ' בעזרת האתר שלנו בכתובת ' + str(obj.ip) + ' בתאריך ' + str(obj.created_at) + ' עבור המוצר ' + str(obj.product)
    from_email = 'שאלה חדשה <Main@ms-global.co.il>'
    to = MAIN_EMAIL_RECEIVER
    html_text = text.replace('\n', '<br>')
    mail.send_mail(subject, text, from_email, [to], html_message=html_text)
@shared_task
def send_cart_notification(cart_id):
    print('=================== send_cart_email is running ==========================')
    cart = SvelteCartModal.objects.get(id=cart_id)
    # subject = to the current date and time if the cart
    if cart.user is not None and cart.user.is_anonymous == False:
        s = str(cart.user.client.businessName)
    else:
        s = str(cart.name)
    subject = str(cart.id) + ') ' + s
    html_message = render_to_string('emails/cart_template.html', {'cart': cart})
    plain_message = strip_tags(html_message)
    from_email = 'עגלת קניות <Main@ms-global.co.il>'
    to = MAIN_EMAIL_RECEIVER
    mail.send_mail(subject, plain_message, from_email, [to], html_message=html_message)
    print('=================== send_cart_email is done ==========================')

    # sending telegram message
    #for chat_id in self.chat_ids:
    chat_id = TELEGRAM_CHAT_ID_CARTS
    telegram_message = '* ' + subject + ' *' + '\n'
    for item in cart.productEntries.all():
        row = str(item.amount) + ' ' + item.product.title + '\n'
        telegram_message += row
    telegram_bot.send_message(chat_id=chat_id, text=telegram_message)
    
'''from __future__ import absolute_import, unicode_literals

from celery import shared_task
from .models import UserSearchData
@shared_task
def save_user_search(session, term, resultCount):
    search_history = UserSearchData.objects.create(session=session, term=q, resultCount=resultCount)
    search_history.save()'''
    
'''
from __future__ import absolute_import, unicode_literals
from celery import shared_task
from catalogAlbum.models import CatalogAlbum
from celery.schedules import crontab

def update_catalogAlbum_timers():
    #albums = CatalogAlbum.objects.all()
    
    print('update_catalogAlbum_timers', albums)
'''