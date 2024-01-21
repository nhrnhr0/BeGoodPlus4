# Generated by Django 3.1 on 2023-09-26 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0042_providersdocxtask_doc_names'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartmodal',
            name='address',
            field=models.CharField(blank=True, max_length=120, null=True, verbose_name='address'),
        ),
        migrations.AddField(
            model_name='sveltecartmodal',
            name='is_delivery_company',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='sveltecartproductentery',
            name='private_comment',
            field=models.TextField(blank=True, null=True, verbose_name='private comment'),
        ),
        migrations.AddField(
            model_name='sveltecartproductentery',
            name='public_comment',
            field=models.TextField(blank=True, null=True, verbose_name='public comment'),
        ),
    ]
