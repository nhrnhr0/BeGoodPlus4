# Generated by Django 3.1 on 2023-09-26 07:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0051_auto_20230926_1052'),
    ]

    operations = [
        migrations.AddField(
            model_name='morderitem',
            name='private_comment',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='morderitem',
            name='public_comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]
