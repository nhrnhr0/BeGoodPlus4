# Generated by Django 3.1 on 2022-03-01 09:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_sveltecartmodal_productsraw'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartproductentery',
            name='cart',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='core.sveltecartmodal'),
        ),
    ]