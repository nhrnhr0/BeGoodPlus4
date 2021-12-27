# Generated by Django 3.1 on 2021-11-24 08:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0006_auto_20211112_1728'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='client',
            name='availabilityDays',
        ),
        migrations.RemoveField(
            model_name='client',
            name='availabilityHours',
        ),
        migrations.AddField(
            model_name='client',
            name='friday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='friday'),
        ),
        migrations.AddField(
            model_name='client',
            name='monday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='monday'),
        ),
        migrations.AddField(
            model_name='client',
            name='saturday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='saturday'),
        ),
        migrations.AddField(
            model_name='client',
            name='sunday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='sunday'),
        ),
        migrations.AddField(
            model_name='client',
            name='thursday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='thursday'),
        ),
        migrations.AddField(
            model_name='client',
            name='tuesday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='tuesday'),
        ),
        migrations.AddField(
            model_name='client',
            name='wednesday',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='wednesday'),
        ),
    ]