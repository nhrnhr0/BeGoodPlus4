# Generated by Django 3.1 on 2022-03-01 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0023_activecarttracker'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartmodal',
            name='productsRaw',
            field=models.JSONField(blank=True, null=True, verbose_name='products'),
        ),
    ]