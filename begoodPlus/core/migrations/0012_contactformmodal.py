# Generated by Django 3.0.8 on 2021-11-01 11:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_auto_20211004_1230'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactFormModal',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device', models.CharField(max_length=250, verbose_name='device')),
                ('name', models.CharField(max_length=120, verbose_name='name')),
                ('phone', models.CharField(max_length=120, verbose_name='phone')),
                ('email', models.EmailField(max_length=120, verbose_name='email')),
                ('message', models.TextField(verbose_name='message')),
            ],
        ),
    ]
