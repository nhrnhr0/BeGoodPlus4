# Generated by Django 3.1 on 2022-04-25 12:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0026_auto_20220425_1409'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='catalogalbum',
            name='order',
        ),
    ]