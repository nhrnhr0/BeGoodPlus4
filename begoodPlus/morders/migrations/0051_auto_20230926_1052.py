# Generated by Django 3.1 on 2023-09-26 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0050_morder_order_sheet_archived'),
    ]

    operations = [
        migrations.AddField(
            model_name='morder',
            name='address',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddField(
            model_name='morder',
            name='is_delivery_company',
            field=models.BooleanField(default=False),
        ),
    ]
