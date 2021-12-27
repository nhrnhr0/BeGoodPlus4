# Generated by Django 3.0.8 on 2021-03-30 01:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['-title'], 'verbose_name': 'category', 'verbose_name_plural': 'categories'},
        ),
        migrations.AlterField(
            model_name='category',
            name='catalog_rep',
            field=models.CharField(blank=True, max_length=1, verbose_name='catalog representation'),
        ),
        migrations.AlterField(
            model_name='category',
            name='title',
            field=models.CharField(max_length=250, verbose_name='title'),
        ),
    ]