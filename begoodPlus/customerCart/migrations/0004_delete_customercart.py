# Generated by Django 3.1 on 2024-04-11 04:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0044_auto_20240411_0719'),
        ('customerCart', '0003_customercart'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CustomerCart',
        ),
    ]
