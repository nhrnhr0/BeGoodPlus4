# Generated by Django 3.1 on 2022-02-18 12:14

import colorfield.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('color', '0003_auto_20220218_1412'),
    ]

    operations = [
        migrations.AlterField(
            model_name='color',
            name='color',
            field=colorfield.fields.ColorField(default='#0000ffff', image_field=None, max_length=18, samples=[('#FFFFFF', 'white'), ('#000000', 'black')], verbose_name='color'),
        ),
    ]
