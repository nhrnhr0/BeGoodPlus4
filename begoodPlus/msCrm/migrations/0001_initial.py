# Generated by Django 3.1 on 2022-03-30 07:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MsCrmBusinessTypeSelect',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='MsCrmIntrest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='MsCrmUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('businessName', models.CharField(max_length=100, verbose_name='business name')),
                ('businessTypeCustom', models.CharField(blank=True, max_length=100, null=True, verbose_name='business type custom')),
                ('name', models.CharField(max_length=100, verbose_name='name')),
                ('phone', models.CharField(blank=True, max_length=100, null=True, verbose_name='phone')),
                ('email', models.EmailField(blank=True, max_length=100, null=True, verbose_name='email')),
                ('address', models.CharField(blank=True, max_length=100, null=True, verbose_name='address')),
                ('want_emails', models.BooleanField(default=True, verbose_name='want emails')),
                ('want_whatsapp', models.BooleanField(default=True, verbose_name='want whatsapp')),
                ('flashy_contact_id', models.CharField(blank=True, max_length=256, null=True, verbose_name='flashy contact id')),
                ('businessSelect', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='msCrm.mscrmbusinesstypeselect', verbose_name='business')),
                ('intrests', models.ManyToManyField(blank=True, to='msCrm.MsCrmIntrest', verbose_name='intrested')),
            ],
        ),
    ]
