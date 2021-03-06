# Generated by Django 3.1 on 2022-06-08 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SmartbeeTokens',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=1024, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expirationUtcDate', models.DateTimeField()),
            ],
            options={
                'verbose_name': 'Token',
                'verbose_name_plural': 'Tokens',
                'ordering': ['-created_at'],
            },
        ),
    ]
