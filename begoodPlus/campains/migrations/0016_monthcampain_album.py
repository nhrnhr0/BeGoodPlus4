# Generated by Django 3.1 on 2022-01-02 06:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0020_remove_catalogalbum_campain'),
        ('campains', '0015_remove_monthcampain_album'),
    ]

    operations = [
        migrations.AddField(
            model_name='monthcampain',
            name='album',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='campain', to='catalogAlbum.catalogalbum', verbose_name='album'),
        ),
    ]