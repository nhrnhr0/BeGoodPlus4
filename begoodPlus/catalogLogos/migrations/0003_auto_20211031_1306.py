# Generated by Django 3.0.8 on 2021-10-31 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogLogos', '0002_cataloglogo_cimg'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cataloglogo',
            name='cimg',
            field=models.CharField(blank=True, max_length=2047, null=True, verbose_name='claudinary url'),
        ),
    ]
