# Generated by Django 3.1 on 2022-05-29 12:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0014_auto_20220529_1342'),
    ]

    operations = [
        migrations.AddField(
            model_name='morderitem',
            name='embroideryComment',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='morderitem',
            name='priningComment',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
