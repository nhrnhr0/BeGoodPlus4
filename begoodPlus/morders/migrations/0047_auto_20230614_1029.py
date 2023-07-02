# Generated by Django 3.1 on 2023-06-14 07:29

import colorfield.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0046_morderstatus_color'),
    ]

    operations = [
        migrations.AlterField(
            model_name='morderstatus',
            name='color',
            field=colorfield.fields.ColorField(default='#FF22E400', image_field=None, max_length=18, samples=[('#FFFFFF', 'white'), ('#000000', 'black'), ('#FFFFFF00', 'transparent')], verbose_name='color'),
        ),
    ]