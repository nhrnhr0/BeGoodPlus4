# Generated by Django 3.0.8 on 2021-11-03 06:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('catalogImages', '0036_auto_20211031_1249'),
        ('auth', '0011_update_proxy_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientOrganizations',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='name')),
            ],
        ),
        migrations.CreateModel(
            name='ClientType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, verbose_name='name')),
            ],
        ),
        migrations.CreateModel(
            name='PaymantWay',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
            ],
        ),
        migrations.CreateModel(
            name='PaymentTime',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
            ],
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('name', models.CharField(max_length=120, verbose_name='business name ')),
                ('extraName', models.CharField(blank=True, max_length=120, null=True, verbose_name='extra name')),
                ('tariff', models.SmallIntegerField(default=0, verbose_name='tariff')),
                ('privateCompany', models.CharField(max_length=254, verbose_name='P.C.')),
                ('address', models.CharField(max_length=511, verbose_name='address')),
                ('contactMan', models.CharField(max_length=100, verbose_name='contact man')),
                ('contactManPosition', models.CharField(max_length=100, verbose_name='contact man position')),
                ('contactManPhone', models.CharField(max_length=100, verbose_name='contact man phone')),
                ('contactMan2', models.CharField(blank=True, max_length=100, null=True, verbose_name='contact man 2')),
                ('contactMan2Phone', models.CharField(blank=True, max_length=100, null=True, verbose_name='contact man 2 phone')),
                ('officePhone', models.CharField(blank=True, max_length=100, null=True, verbose_name='office phone')),
                ('extraMail', models.EmailField(blank=True, max_length=100, null=True, verbose_name='extra email')),
                ('isWithholdingTax', models.BooleanField(default=False)),
                ('availabilityHours', models.TextField(blank=True, verbose_name='availability hours')),
                ('availabilityDays', models.TextField(blank=True, verbose_name='availability days')),
                ('comment', models.TextField(blank=True, null=True, verbose_name='comments')),
                ('categorys', models.ManyToManyField(blank=True, to='catalogImages.CatalogImage', verbose_name='categories')),
                ('howPay', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='client.PaymantWay')),
                ('organization', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='client.ClientOrganizations')),
                ('storeType', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='client.ClientType', verbose_name='store type')),
                ('whenPay', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='client.PaymentTime')),
            ],
        ),
    ]
