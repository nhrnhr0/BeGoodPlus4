# Generated by Django 3.1 on 2022-01-16 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0040_auto_20220106_1714'),
    ]

    operations = [
        migrations.AddField(
            model_name='catalogimage',
            name='amountCarton',
            field=models.IntegerField(default=0, verbose_name='amount in carton'),
        ),
        migrations.AddField(
            model_name='catalogimage',
            name='amountSinglePack',
            field=models.IntegerField(default=0, verbose_name='amount in single pack'),
        ),
    ]