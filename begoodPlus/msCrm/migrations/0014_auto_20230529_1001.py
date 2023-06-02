# Generated by Django 3.1 on 2023-05-29 07:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('msCrm', '0013_mscrmmessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='mscrmbusinesstypeselect',
            name='last_message',
            field=models.TextField(blank=True, null=True, verbose_name='last message'),
        ),
        migrations.AddField(
            model_name='mscrmbusinesstypeselect',
            name='last_message_date',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last message date'),
        ),
        migrations.AlterField(
            model_name='mscrmmessage',
            name='businessSelect',
            field=models.ManyToManyField(related_name='ms_crm_messages', to='msCrm.MsCrmBusinessTypeSelect'),
        ),
    ]
