# Generated by Django 3.1 on 2022-02-24 04:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcrm', '0004_auto_20220116_1310'),
    ]

    operations = [
        migrations.CreateModel(
            name='CrmTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='name')),
            ],
        ),
        migrations.AddField(
            model_name='crmuser',
            name='tags',
            field=models.ManyToManyField(blank=True, to='mcrm.CrmTag', verbose_name='tags'),
        ),
    ]