# Generated by Django 3.0.8 on 2021-10-30 03:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0034_auto_20211030_0538'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogimage',
            name='cimage',
            field=models.URLField(blank=True, max_length=2047, null=True, verbose_name='cloudinary image url'),
        ),
    ]
