# Generated by Django 3.1 on 2022-01-13 06:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcrm', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='crmuser',
            name='flashy_contact_id',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]