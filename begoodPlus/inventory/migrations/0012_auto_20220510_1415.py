# Generated by Django 3.1 on 2022-05-10 11:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('productSize', '0002_auto_20210330_0407'),
        ('catalogImages', '0055_auto_20220424_1335'),
        ('color', '0005_auto_20220222_1012'),
        ('inventory', '0011_ppn_barcode'),
    ]

    operations = [
        migrations.RenameField(
            model_name='productenteritems',
            old_name='quantity',
            new_name='total_quantity',
        ),
        migrations.RemoveField(
            model_name='productenteritems',
            name='sku',
        ),
        migrations.RemoveField(
            model_name='warehousestock',
            name='buyHistory',
        ),
        migrations.RemoveField(
            model_name='warehousestock',
            name='quantity',
        ),
        migrations.RemoveField(
            model_name='warehousestock',
            name='sku',
        ),
        migrations.AddField(
            model_name='productenteritems',
            name='ppn',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='inventory.ppn'),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='ProductEnterItemsEntries',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('color', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='color.color')),
                ('size', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='productSize.productsize')),
                ('verient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='catalogImages.catalogimagevarient')),
            ],
        ),
        migrations.AddField(
            model_name='productenteritems',
            name='entries',
            field=models.ManyToManyField(to='inventory.ProductEnterItemsEntries'),
        ),
    ]
