# Generated by Django 3.1 on 2022-01-02 06:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('campains', '0014_auto_20220102_0809'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='monthcampain',
            name='album',
        ),
    ]
