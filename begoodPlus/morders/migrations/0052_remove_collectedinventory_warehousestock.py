# Generated by Django 3.1 on 2024-04-08 16:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0051_auto_20240408_1931'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='collectedinventory',
            name='warehouseStock',
        ),
    ]
