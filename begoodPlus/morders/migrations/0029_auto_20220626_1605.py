# Generated by Django 3.1 on 2022-06-26 13:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0032_auto_20220626_1605'),
        ('morders', '0028_merge_20220626_1458'),
    ]

    operations = [
        migrations.AlterField(
            model_name='morderitem',
            name='toProviders',
            field=models.ManyToManyField(blank=True, related_name='orderItem', to='inventory.ProviderRequest'),
        ),
        migrations.DeleteModel(
            name='ProviderRequest',
        ),
    ]
