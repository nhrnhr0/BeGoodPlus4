# Generated by Django 3.1 on 2024-04-17 16:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0039_auto_20240411_1538'),
    ]

    operations = [
        migrations.AlterField(
            model_name='throughimage',
            name='image_order',
            field=models.PositiveIntegerField(db_index=True, default=0),
        ),
    ]
