# Generated by Django 3.1 on 2024-04-11 03:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0053_auto_20240411_0654'),
        ('campains', '0020_auto_20240411_0654'),
        ('core', '0042_providersdocxtask_doc_names'),
    ]

    operations = [
        migrations.DeleteModel(
            name='SvelteCartModal',
        ),
    ]