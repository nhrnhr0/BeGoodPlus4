# Generated by Django 3.1 on 2022-03-01 14:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0025_sveltecartproductentery_cart'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sveltecartproductentery',
            name='cart',
        ),
    ]
