# Generated by Django 3.1 on 2022-03-29 16:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mcrm', '0015_auto_20220329_1901'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='crmuser',
            unique_together={('businessName', 'businessType', 'businessTypeCustom')},
        ),
    ]