# Generated by Django 3.1 on 2022-05-13 06:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0016_auto_20220512_1352'),
    ]

    operations = [
        migrations.AddField(
            model_name='docstockenter',
            name='new_products',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='ppn',
            name='providerProductName',
            field=models.CharField(max_length=100, verbose_name='provider makat'),
        ),
    ]