# Generated by Django 3.1 on 2022-03-16 09:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('provider', '0003_auto_20211013_1947'),
        ('catalogImages', '0048_auto_20220309_0825'),
    ]

    operations = [
        migrations.CreateModel(
            name='PPN',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('providerProductName', models.CharField(max_length=100)),
                ('fastProductTitle', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='catalogImages.catalogimage')),
                ('provider', models.ForeignKey(default=7, on_delete=django.db.models.deletion.SET_DEFAULT, to='provider.provider')),
            ],
            options={
                'unique_together': {('provider', 'providerProductName')},
            },
        ),
    ]