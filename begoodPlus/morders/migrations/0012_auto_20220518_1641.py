# Generated by Django 3.1 on 2022-05-18 13:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0011_auto_20220417_1317'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='morderitem',
            options={'ordering': ['product__title']},
        ),
    ]
