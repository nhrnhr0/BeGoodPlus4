# Generated by Django 3.1 on 2023-06-15 14:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('productSize', '0005_auto_20230615_1756'),
    ]

    operations = [
        migrations.AddField(
            model_name='productsize',
            name='size2',
            field=models.CharField(default='X', max_length=30, verbose_name='size'),
        ),
    ]
