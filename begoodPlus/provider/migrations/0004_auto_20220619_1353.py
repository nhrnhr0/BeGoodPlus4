# Generated by Django 3.1 on 2022-06-19 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('provider', '0003_auto_20211013_1947'),
    ]

    operations = [
        migrations.AlterField(
            model_name='provider',
            name='name',
            field=models.CharField(max_length=150, unique=True, verbose_name='name'),
        ),
    ]