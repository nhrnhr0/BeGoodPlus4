# Generated by Django 3.1 on 2024-04-11 10:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0032_catalogalbum_show_on_main_page'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='catalogalbum',
            options={'ordering': ['topLevelCategory__my_order', 'album_order']},
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='level',
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='lft',
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='rght',
        ),
        migrations.RemoveField(
            model_name='catalogalbum',
            name='tree_id',
        ),
    ]
