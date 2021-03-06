# Generated by Django 3.1 on 2022-05-23 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0025_auto_20220522_1625'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='warehousestock',
            options={'ordering': ['-created_at']},
        ),
        migrations.AddField(
            model_name='ppn',
            name='has_phisical_barcode',
            field=models.BooleanField(default=False, verbose_name='has phisical barcode'),
        ),
    ]
