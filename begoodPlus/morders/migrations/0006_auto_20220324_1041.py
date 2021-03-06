# Generated by Django 3.1 on 2022-03-24 08:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('color', '0005_auto_20220222_1012'),
        ('productSize', '0002_auto_20210330_0407'),
        ('catalogImages', '0049_catalogimage_qyt'),
        ('morders', '0005_auto_20220322_1322'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='morderitem',
            name='clientBuyPrice',
        ),
        migrations.RemoveField(
            model_name='morderitem',
            name='clientProvider',
        ),
        migrations.RemoveField(
            model_name='morderitem',
            name='color',
        ),
        migrations.RemoveField(
            model_name='morderitem',
            name='quantity',
        ),
        migrations.RemoveField(
            model_name='morderitem',
            name='size',
        ),
        migrations.RemoveField(
            model_name='morderitem',
            name='varient',
        ),
        migrations.CreateModel(
            name='MOrderItemEntry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField(default=1)),
                ('color', models.ForeignKey(blank=True, default=76, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to='color.color')),
                ('size', models.ForeignKey(blank=True, default=108, null=True, on_delete=django.db.models.deletion.SET_DEFAULT, to='productSize.productsize')),
                ('varient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='catalogImages.catalogimagevarient')),
            ],
        ),
        migrations.AddField(
            model_name='morderitem',
            name='entries',
            field=models.ManyToManyField(blank=True, related_name='product', to='morders.MOrderItemEntry'),
        ),
    ]
