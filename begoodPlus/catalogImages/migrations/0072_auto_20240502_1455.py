# Generated by Django 3.1 on 2024-05-02 11:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0071_subimages'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='subimages',
            options={'ordering': ('catalogImage', 'order')},
        ),
    ]
