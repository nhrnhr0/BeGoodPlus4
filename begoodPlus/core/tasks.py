from __future__ import absolute_import, unicode_literals

from begoodPlus.celery import app

from celery import shared_task


import time

from client.models import UserSessionLogger
from core.models import SvelteCartModal


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
        else:
            ret.append({session, False})
    return ret

from django.template.loader import render_to_string
from django.core import mail
from django.utils.html import strip_tags
from django.conf import settings
@shared_task
def send_cart_email(cart_id):
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
    to = settings.MAIN_EMAIL_RECEIVER
    mail.send_mail(subject, plain_message, from_email, [to], html_message=html_message)
    print('=================== send_cart_email is done ==========================')

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