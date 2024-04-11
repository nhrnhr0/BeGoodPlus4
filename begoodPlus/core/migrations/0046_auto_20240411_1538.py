# Generated by Django 3.1 on 2024-04-11 12:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0045_delete_activecarttracker'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='usersearchdata',
            options={'verbose_name': 'user search', 'verbose_name_plural': 'user searchs'},
        ),
        migrations.AlterField(
            model_name='usersearchdata',
            name='created_date',
            field=models.DateTimeField(auto_now_add=True, null=True, verbose_name='created date'),
        ),
        migrations.AlterField(
            model_name='usersearchdata',
            name='session',
            field=models.CharField(max_length=50, verbose_name='session'),
        ),
        migrations.AlterField(
            model_name='usersearchdata',
            name='term',
            field=models.CharField(max_length=50, verbose_name='term'),
        ),
    ]
