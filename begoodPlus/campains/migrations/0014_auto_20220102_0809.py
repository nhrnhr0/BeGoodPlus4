# Generated by Django 3.1 on 2022-01-02 06:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0018_catalogalbum_is_campain'),
        ('campains', '0013_auto_20220102_0803'),
    ]

    operations = [
        migrations.AlterField(
            model_name='monthcampain',
            name='album',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='campain', to='catalogAlbum.catalogalbum', verbose_name='album'),
        ),
    ]