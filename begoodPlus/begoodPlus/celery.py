from __future__ import absolute_import, unicode_literals
from begoodPlus.secrects import *

import os
from celery import Celery
BASE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', DJANGO_SETTINGS_MODULE)

app = Celery('begoodPlus')

app.config_from_object('django.conf:settings', namespace='CELERY')
from celery.schedules import crontab

app.autodiscover_tasks()
app.conf.broker_url = BASE_REDIS_URL
app.conf.beat_scheduler = 'django_celery_beat.schedulers.DatabaseScheduler'

'''
from backend.celery import app
from backend.celery import task

@app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    print('setup_periodic_tasks')
    # Call every 2 hours 52 min.
    sender.add_periodic_task(
        crontab(minute='*'),
        'catalogAlbum.tasks.test'
    )
task = app.task;
'''