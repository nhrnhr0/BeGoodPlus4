# Generated by Django 3.1 on 2023-05-25 22:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0042_auto_20230130_1336'),
        ('docsSignature', '0012_auto_20230526_0055'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mordersignaturesimulationconnecteditem',
            name='item',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='morders.morderitem'),
        ),
    ]
