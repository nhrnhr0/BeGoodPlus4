# Generated by Django 3.1 on 2022-08-14 00:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0032_catalogalbum_show_on_main_page'),
        ('catalogImages', '0058_catalogimage_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='catalogimage',
            name='main_public_album',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='main_album', to='catalogAlbum.catalogalbum'),
        ),
    ]
