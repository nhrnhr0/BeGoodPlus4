# Generated by Django 3.1 on 2024-04-11 05:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0065_auto_20240411_0828'),
        ('catalogImageDetail', '0002_catalogimagedetail_providermakat'),
    ]

    operations = [
        migrations.DeleteModel(
            name='CatalogImageDetail',
        ),
    ]