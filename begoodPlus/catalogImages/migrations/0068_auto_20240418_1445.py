# Generated by Django 3.1 on 2024-04-18 11:45

import cloudinary.models
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0067_auto_20240418_1442'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogimage',
            name='image',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='תמונת מוצר'),
        ),
    ]
