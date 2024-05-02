# Generated by Django 3.1 on 2024-04-11 11:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0033_auto_20240411_1308'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='catalogalbum',
            options={'ordering': ['topLevelCategory__my_order', 'album_order'], 'verbose_name': 'catalog album', 'verbose_name_plural': 'catalog albums'},
        ),
        migrations.AlterField(
            model_name='catalogalbum',
            name='album_order',
            field=models.PositiveIntegerField(blank=True, default=0, null=True, verbose_name='album order'),
        ),
        migrations.AlterField(
            model_name='catalogalbum',
            name='topLevelCategory',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='albums', to='catalogAlbum.toplevelcategory', verbose_name='top level category'),
        ),
    ]