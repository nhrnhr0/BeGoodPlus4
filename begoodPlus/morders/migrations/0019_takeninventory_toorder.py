# Generated by Django 3.1 on 2022-05-31 09:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0018_morder_isorder'),
    ]

    operations = [
        migrations.AddField(
            model_name='takeninventory',
            name='toOrder',
            field=models.IntegerField(default=0),
        ),
    ]