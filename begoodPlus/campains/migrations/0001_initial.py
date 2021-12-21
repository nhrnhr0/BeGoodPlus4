# Generated by Django 3.1 on 2021-12-21 08:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('client', '0010_auto_20211212_1507'),
        ('catalogImages', '0036_auto_20211031_1249'),
    ]

    operations = [
        migrations.CreateModel(
            name='AmountBrakepoint',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=100, verbose_name='text')),
                ('number', models.DecimalField(decimal_places=3, max_digits=10, verbose_name='number')),
            ],
        ),
        migrations.CreateModel(
            name='CampainProduct',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='PaymantType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=100, verbose_name='text')),
            ],
        ),
        migrations.CreateModel(
            name='PriceTable',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amountBrakepoint', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='campains.amountbrakepoint', verbose_name='amount brakepoint')),
                ('paymentType', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='campains.paymanttype', verbose_name='payment type')),
            ],
        ),
        migrations.CreateModel(
            name='MonthCampain',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_shown', models.BooleanField(default=False, verbose_name='is shown')),
                ('name', models.CharField(max_length=254, verbose_name='name')),
                ('products', models.ManyToManyField(to='campains.CampainProduct', verbose_name='products')),
                ('users', models.ManyToManyField(to='client.Client', verbose_name='users')),
            ],
        ),
        migrations.AddField(
            model_name='campainproduct',
            name='priceTable',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='campains.pricetable', verbose_name='price table'),
        ),
        migrations.AddField(
            model_name='campainproduct',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalogImages.catalogimage', verbose_name='product'),
        ),
    ]
