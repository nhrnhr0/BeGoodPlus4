from celery import shared_task


import time

from client.models import UserSessionLogger


@shared_task
def test(a,b):
    print('hey')
    time.sleep(5)
    return a+b
import datetime
from django.utils import timezone
@shared_task(name="close-inactive-user-sessions")
def close_inactive_user_sessions():
    print('=================== close_inactive_user_sessions is running ==========================')
    active_sessions = UserSessionLogger.objects.filter(is_active=True)
    for session in active_sessions:
        last_log = session.logs.last()
        # set session_expiry_time to 5 minutes
        session_expiry_time = datetime.timedelta(minutes=5)
        now = timezone.now()

        if last_log.timestamp < now - session_expiry_time:
            session.is_active = False
            session.session_end_timestemp = last_log.timestamp
            session.save()

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