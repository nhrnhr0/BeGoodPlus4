# Generated by Django 3.0.8 on 2021-03-30 01:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('productSize', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='productsize',
            options={'default_related_name': 'productSizes', 'ordering': ('code',), 'verbose_name': 'Product size', 'verbose_name_plural': 'Product sizes'},
        ),
        migrations.AlterField(
            model_name='productsize',
            name='code',
            field=models.CharField(default=0, max_length=2, verbose_name='code'),
        ),
        migrations.AlterField(
            model_name='productsize',
            name='size',
            field=models.CharField(default='X', max_length=30, unique=True, verbose_name='size'),
        ),
    ]
