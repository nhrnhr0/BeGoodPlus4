# Generated by Django 3.1 on 2022-05-30 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0017_morder_archive'),
    ]

    operations = [
        migrations.AddField(
            model_name='morder',
            name='isOrder',
            field=models.BooleanField(default=False),
        ),
    ]
