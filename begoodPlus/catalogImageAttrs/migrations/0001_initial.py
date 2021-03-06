# Generated by Django 3.1 on 2022-01-31 09:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ProductPriceEntry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('amount', models.IntegerField(default=0)),
            ],
            options={
                'verbose_name': 'catalog image client price entry',
                'verbose_name_plural': 'catalog image client price entries',
                'ordering': ['amount'],
            },
        ),
        migrations.CreateModel(
            name='ProductPrices',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_modified', models.DateTimeField(auto_now=True)),
                ('prices', models.ManyToManyField(blank=True, to='catalogImageAttrs.ProductPriceEntry')),
            ],
        ),
    ]
