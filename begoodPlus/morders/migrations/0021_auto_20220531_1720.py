# Generated by Django 3.1 on 2022-05-31 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0020_remove_takeninventory_toorder'),
    ]

    operations = [
        migrations.AddField(
            model_name='morder',
            name='sendProviders',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='morder',
            name='startCollecting',
            field=models.BooleanField(default=False),
        ),
    ]
