# Generated by Django 3.1 on 2022-06-09 11:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('provider', '0003_auto_20211013_1947'),
        ('color', '0005_auto_20220222_1012'),
        ('catalogImages', '0056_auto_20220525_1232'),
        ('productSize', '0002_auto_20210330_0407'),
        ('morders', '0025_remove_takeninventory_barcode'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProviderRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('force_physical_barcode', models.BooleanField(default=False)),
                ('quantity', models.IntegerField(default=0)),
                ('color', models.ForeignKey(blank=True, default=76, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to='color.color')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='provider_request', to='provider.provider')),
                ('size', models.ForeignKey(blank=True, default=108, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to='productSize.productsize')),
                ('varient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='catalogImages.catalogimagevarient')),
            ],
        ),
        migrations.AddField(
            model_name='morderitem',
            name='toProviders',
            field=models.ManyToManyField(blank=True, related_name='orderItem', to='morders.ProviderRequest'),
        ),
    ]
