# Generated by Django 3.1 on 2022-03-01 16:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0026_remove_sveltecartproductentery_cart'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sveltecartmodal',
            name='productsRaw',
            field=models.CharField(blank=True, max_length=2048, null=True, verbose_name='products'),
        ),
    ]
