# Generated by Django 3.0.8 on 2021-10-30 02:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0033_catalogimage_cimage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogimage',
            name='cimage',
            field=models.URLField(blank=True, null=True, verbose_name='cloudinary image url'),
        ),
    ]