# Generated by Django 3.1 on 2022-08-22 07:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('msCrm', '0009_auto_20220822_1045'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mscrmuser',
            name='phone',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True, verbose_name='phone'),
        ),
    ]
