# Generated by Django 3.1 on 2024-04-11 04:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0005_delete_product'),
        ('category', '0002_auto_20210330_0407'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Category',
        ),
    ]
