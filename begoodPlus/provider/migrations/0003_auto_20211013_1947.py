# Generated by Django 3.0.8 on 2021-10-13 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('provider', '0002_auto_20210330_0407'),
    ]

    operations = [
        migrations.AlterField(
            model_name='provider',
            name='code',
            field=models.CharField(default='A', max_length=3, verbose_name='code'),
        ),
    ]