# Generated by Django 3.1 on 2022-05-19 12:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0021_auto_20220515_1153'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ppn',
            name='store_price',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=10, null=True, verbose_name='Store Price (no tax)'),
        ),
    ]
