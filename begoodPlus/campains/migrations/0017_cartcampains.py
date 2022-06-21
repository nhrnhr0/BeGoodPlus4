# Generated by Django 3.1 on 2022-06-04 04:10

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0037_auto_20220425_1409'),
        ('client', '0020_clienttype_tariff'),
        ('campains', '0016_monthcampain_album'),
    ]

    operations = [
        migrations.CreateModel(
            name='CartCampains',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='title')),
                ('end_showing_date', models.DateTimeField(default=datetime.datetime.now, verbose_name='End showing date')),
                ('cart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='campain_cart', to='core.sveltecartmodal', verbose_name='cart')),
                ('users', models.ManyToManyField(blank=True, to='client.Client', verbose_name='users')),
            ],
        ),
    ]
