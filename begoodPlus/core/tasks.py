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
    text = '???????? ?????????? ???????????? ?????? ????????'
    text += '\n'
    text += '<b> ????: </b> {name}'.format(**info)
    text += '\n'
    text += '<b> ??????????: </b> {phone}'.format(**info)
    text += '\n'
    text += '<b> ????????????: </b> {email}'.format(**info)
    text += '\n'
    text += '<b> ??????????: </b> {message}'.format(**info)
    text += '\n'
    text += '<b> ?????????? ?????????? ??????????: </b> {created_date}'.format(**info)
    text += '\n'
    text += '<b> ???????? ??????????: </b> {uid}'.format(**info)
    text += '\n'
    text += '<b> ??????????: </b> {device}'.format(**info)
    subject = '???????? ?????????? ???????????? ?????? ????????'
    from_email = '???????? ?????????? ???????????? ?????? <Main@ms-global.co.il>'
    to = MAIN_EMAIL_RECEIVER
    html_text = text.replace('\n', '<br>')
    mail.send_mail(subject, text, from_email, [to], html_message=html_text)
    telegram_bot.send_message(chat_id=chat_id, text=text, parse_mode=telegram.ParseMode.HTML)
@shared_task
def product_photo_send_notification(user_product_photo):
    obj = UserProductPhoto.objects.get(id=user_product_photo)
    chat_id = TELEGRAM_CHAT_ID_PRODUCT_PHOTO
    caption = '<b> ??????????: </b> ' + str(obj.user) + '\n<b> ??????????: </b> ' + obj.description + '\n<b> ???????? ??????????: </b> '+str(obj.buy_price)+'\n<b> ???????? ????????: </b> '+ str(obj.want_price) +' '

    if obj.photo:
        image = obj.photo.url
        telegram_bot.send_photo(chat_id, image, caption=caption, parse_mode=telegram.ParseMode.HTML)
    else:
        telegram_bot.send_message(chat_id, caption, parse_mode=telegram.ParseMode.HTML)
    try:
        email_html = caption.replace('\n', '<br>')
        email_text = strip_tags(email_html)
        if image:
            email_html += '<img src="'+image+'" width="100%">'
        subject = '?????????? ???????? ???? ?????????? ?????? ????????' + str(obj.id)
        from_email = '???????? ???????? <Main@ms-global.co.il>'
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
        'name': obj.name,
        'buissnes_name': obj.buissnes_name,
        'phone': obj.phone,
        'email': obj.email,
    }
    chat_id = TELEGRAM_CHAT_ID_QUESTIONS
    text = '???????? ????????\n IP: <b> {ip} </b>\n :?????????? <b> {created_at} </b> :???????? <b> {product} </b>\n'.format(**info)
    text += '???????? ??????????:\n'
    text += '??????????: <b>{user}</b>\n'.format(**info)
    text += '????: <b>{name}</b>\n'.format(**info)
    text += '??????: <b>{buissnes_name}</b>\n'.format(**info)
    text += '??????????: <b>{phone}</b>\n'.format(**info)
    text += '????????????: <b>{email}</b>\n'.format(**info)
    text += '\n\n??????????: <b>{question}</b>\n'.format(**info)
    telegram_bot.send_message(chat_id=chat_id, text=text, parse_mode=telegram.ParseMode.HTML)
    
    subject = '???????? ???????? ?????????? ???? ?????? ' + str(obj.user) + ' ?????????? ???????? ???????? ???????????? ' + str(obj.ip) + ' ???????????? ' + str(obj.created_at) + ' ???????? ?????????? ' + str(obj.product)
    from_email = '???????? ???????? <Main@ms-global.co.il>'
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
    from_email = '???????? ?????????? <Main@ms-global.co.il>'
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