# Generated by Django 3.1 on 2022-01-24 13:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_sveltecartmodal_businessname'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartproductentery',
            name='details',
            field=models.JSONField(blank=True, null=True, verbose_name='details'),
        ),
    ]
