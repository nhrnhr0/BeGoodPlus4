# Generated by Django 3.0.8 on 2021-03-30 01:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('productSize', '0002_auto_20210330_0407'),
        ('product', '0003_auto_20210330_0407'),
        ('productColor', '0002_auto_20210330_0407'),
        ('packingType', '0002_auto_20210330_0407'),
        ('provider', '0002_auto_20210330_0407'),
        ('stock', '0002_auto_20201202_0759'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='stock',
            options={'default_related_name': 'stocks', 'verbose_name': 'Stock', 'verbose_name_plural': 'Stocks'},
        ),
        migrations.AlterField(
            model_name='stock',
            name='amount',
            field=models.IntegerField(default=0, verbose_name='stock at us'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='buy_cost',
            field=models.FloatField(default=0, verbose_name='buy cost'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='const_inst_client_max',
            field=models.FloatField(default=0, null=True, verbose_name='to'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='const_inst_client_min',
            field=models.FloatField(default=0, null=True, verbose_name='cost for institucional without tax from'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='const_sing_client',
            field=models.FloatField(default=0, verbose_name='cost for single client with tax'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='packingType',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='packingType.PackingType', verbose_name='packing type'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='product.Product', verbose_name='product name'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='productColor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='productColor.ProductColor', verbose_name='color'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='productSize',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='productSize.ProductSize', verbose_name='size'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='provider',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stocks', to='provider.Provider', verbose_name='product provider'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='providerMakat',
            field=models.CharField(blank=True, max_length=50, verbose_name='provider makat'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='provider_has_stock',
            field=models.BooleanField(default=True, verbose_name='exist at provider'),
        ),
        migrations.AlterField(
            model_name='stock',
            name='provider_resupply_date',
            field=models.DateTimeField(blank=True, null=True, verbose_name='provider resupply date'),
        ),
    ]
