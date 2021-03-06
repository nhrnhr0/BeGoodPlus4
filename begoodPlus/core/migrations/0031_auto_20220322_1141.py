# Generated by Django 3.1 on 2022-03-22 09:41

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0030_sveltecartproductentery_unitprice'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartmodal',
            name='agent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='agent', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='sveltecartmodal',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='user_cart', to=settings.AUTH_USER_MODEL),
        ),
    ]
