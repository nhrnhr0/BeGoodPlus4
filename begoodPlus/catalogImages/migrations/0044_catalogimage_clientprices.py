# Generated by Django 3.1 on 2022-01-31 09:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImageAttrs', '0001_initial'),
        ('catalogImages', '0043_auto_20220126_1133'),
    ]

    operations = [
        migrations.AddField(
            model_name='catalogimage',
            name='clientPrices',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='catalogImageAttrs.productprices'),
        ),
    ]
