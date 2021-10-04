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