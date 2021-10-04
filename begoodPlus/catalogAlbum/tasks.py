
from begoodPlus.celery import app
#from begoodPlus.celery import shered_task
from celery import shared_task



@shared_task
def test(a,b):
    print('hey')
    return a+b
    

import datetime
import pytz

from catalogAlbum.models import CatalogAlbum
@shared_task
def update_catalogAlbum_timers():
    all = CatalogAlbum.objects.all()
    utc=pytz.utc

    updated = []
    for album in all:
        timer = album.timer
        if timer == None:
            continue
        current = datetime.datetime.now()
        renew_after = album.renew_after
        new_timer = current - renew_after
        datetime_start = timer
        datetime_end = utc.localize(new_timer)
        
        
        if datetime_start <= datetime_end:
            timer = current + album.renew_for
            updated.append(album)
            album.timer = utc.localize(timer)
            album.save()
    return updated