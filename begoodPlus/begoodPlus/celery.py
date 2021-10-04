from __future__ import absolute_import, unicode_literals

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'begoodPlus.settings')

app = Celery('begoodPlus')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()
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