# Generated by Django 3.1 on 2022-08-09 09:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogAlbum', '0029_auto_20220707_1459'),
    ]

    operations = [
        migrations.AddField(
            model_name='toplevelcategory',
            name='slug',
            field=models.SlugField(allow_unicode=True, blank=True, max_length=120, null=True, unique=True, verbose_name='slug'),
        ),
    ]