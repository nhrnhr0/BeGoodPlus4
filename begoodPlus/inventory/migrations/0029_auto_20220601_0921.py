# Generated by Django 3.1 on 2022-06-01 06:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0028_auto_20220523_1512'),
    ]

    operations = [
        migrations.AddField(
            model_name='ppn',
            name='providerMakat',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name="provider's makat"),
        ),
        migrations.AlterField(
            model_name='ppn',
            name='barcode',
            field=models.CharField(blank=True, default='', max_length=100, verbose_name='barcode'),
        ),
        migrations.AlterField(
            model_name='ppn',
            name='providerProductName',
            field=models.CharField(max_length=100, verbose_name="provide's product name"),
        ),
    ]
