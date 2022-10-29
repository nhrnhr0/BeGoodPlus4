# Generated by Django 3.1 on 2022-10-07 13:55

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('docsSignature', '0003_mordersignature_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mordersignature',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4),
        ),
    ]
