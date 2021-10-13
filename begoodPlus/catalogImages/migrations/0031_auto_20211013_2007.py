# Generated by Django 3.0.8 on 2021-10-13 17:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('packingType', '0002_auto_20210330_0407'),
        ('catalogImages', '0030_auto_20211006_1253'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogimage',
            name='packingTypeClient',
            field=models.ForeignKey(default=9, on_delete=django.db.models.deletion.SET_DEFAULT, related_name='PTclient', to='packingType.PackingType', verbose_name='packing type for client'),
        ),
        migrations.AlterField(
            model_name='catalogimage',
            name='packingTypeProvider',
            field=models.ForeignKey(default=9, on_delete=django.db.models.deletion.SET_DEFAULT, related_name='PTprovider', to='packingType.PackingType', verbose_name='packing type from provider'),
        ),
    ]
