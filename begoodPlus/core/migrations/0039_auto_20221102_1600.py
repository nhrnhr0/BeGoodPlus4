# Generated by Django 3.1 on 2022-11-02 14:00

import django.core.files.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0038_providersdocxtask'),
    ]

    operations = [
        migrations.AlterField(
            model_name='providersdocxtask',
            name='docx',
            field=models.FileField(blank=True, null=True, storage=django.core.files.storage.FileSystemStorage(location='C:\\Users\\ronio\\Desktop\\projects\\BeGoodPlus4\\begoodPlus\\static\\media_root/'), upload_to='docx'),
        ),
    ]
