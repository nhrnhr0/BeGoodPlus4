# Generated by Django 3.0.8 on 2021-11-01 16:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0036_auto_20211031_1249'),
        ('core', '0013_contactformmodal_uid'),
    ]

    operations = [
        migrations.CreateModel(
            name='SvelteCartModal',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device', models.CharField(max_length=250, verbose_name='device')),
                ('uid', models.UUIDField(blank=True, null=True, verbose_name='uuid')),
                ('name', models.CharField(max_length=120, verbose_name='name')),
                ('phone', models.CharField(max_length=120, verbose_name='phone')),
                ('email', models.EmailField(max_length=120, verbose_name='email')),
                ('created_date', models.DateTimeField(auto_now_add=True, null=True)),
                ('products', models.ManyToManyField(blank=True, null=True, to='catalogImages.CatalogImage')),
            ],
        ),
        migrations.CreateModel(
            name='SvelteContactFormModal',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device', models.CharField(max_length=250, verbose_name='device')),
                ('uid', models.UUIDField(blank=True, null=True, verbose_name='uuid')),
                ('name', models.CharField(max_length=120, verbose_name='name')),
                ('phone', models.CharField(max_length=120, verbose_name='phone')),
                ('email', models.EmailField(max_length=120, verbose_name='email')),
                ('message', models.TextField(verbose_name='message')),
                ('created_date', models.DateTimeField(auto_now_add=True, null=True)),
            ],
        ),
        migrations.DeleteModel(
            name='ContactFormModal',
        ),
    ]
