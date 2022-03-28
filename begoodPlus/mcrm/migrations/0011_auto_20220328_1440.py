# Generated by Django 3.1 on 2022-03-28 11:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mcrm', '0010_auto_20220328_1432'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='crmbusinesstypeselect',
            options={'ordering': ['my_order']},
        ),
        migrations.AddField(
            model_name='crmbusinesstypeselect',
            name='my_order',
            field=models.PositiveIntegerField(db_index=True, default=0, editable=False),
        ),
    ]
