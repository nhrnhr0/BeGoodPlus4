# Generated by Django 3.1 on 2022-05-31 12:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0019_takeninventory_toorder'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='takeninventory',
            name='toOrder',
        ),
    ]