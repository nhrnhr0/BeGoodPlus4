# Generated by Django 3.0.8 on 2021-03-23 06:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0009_catalogalbum_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogalbum',
            name='description',
            field=models.TextField(blank=True, default='', verbose_name='תיאור'),
        ),
        migrations.AlterField(
            model_name='catalogalbum',
            name='keywords',
            field=models.TextField(blank=True, default='', verbose_name='keyworks'),
        ),
    ]
