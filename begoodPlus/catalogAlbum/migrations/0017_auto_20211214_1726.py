# Generated by Django 3.1 on 2021-12-14 15:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0016_auto_20210914_0812'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='catalogalbum',
            name='renew_after',
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='renew_for',
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='timer',
        ),
    ]
