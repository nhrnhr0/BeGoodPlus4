# Generated by Django 3.1 on 2022-06-27 09:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0034_auto_20220627_0948'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productenteritems',
            name='providerRequests',
            field=models.ManyToManyField(blank=True, related_name='prodEnterItem', to='inventory.ProviderRequestToEnter'),
        ),
    ]
