# Generated by Django 3.1 on 2022-06-28 13:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0035_auto_20220627_1240'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='productenteritems',
            name='providerRequests',
        ),
        migrations.DeleteModel(
            name='ProviderRequestToEnter',
        ),
    ]
