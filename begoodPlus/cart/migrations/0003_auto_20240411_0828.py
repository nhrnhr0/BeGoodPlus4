# Generated by Django 3.1 on 2024-04-11 05:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('productColor', '0002_auto_20210330_0407'),
        ('cart', '0002_auto_20240410_0042'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cartitementry',
            name='color',
            field=models.ForeignKey(blank=True, default=76, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to='productColor.productcolor'),
        ),
    ]
