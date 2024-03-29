# Generated by Django 3.1 on 2022-07-09 04:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0056_auto_20220525_1232'),
        ('client', '0020_clienttype_tariff'),
        ('msCrm', '0004_mscrmintrestsgroups'),
    ]

    operations = [
        migrations.CreateModel(
            name='MsCrmWhatsappMessage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('message', models.TextField(verbose_name='message')),
            ],
        ),
        # migrations.AddField(
        #     model_name='mscrmuser',
        #     name='clients',
        #     field=models.ManyToManyField(blank=True, to='client.Client', verbose_name='clients'),
        # ),
        migrations.CreateModel(
            name='MsCrmWhatsappMessagesSent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('crmUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='msCrm.mscrmuser', verbose_name='crmUser')),
                ('whatsapp_message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='msCrm.mscrmwhatsappmessage', verbose_name='whatsappMessage')),
            ],
        ),
        migrations.CreateModel(
            name='MsCrmWhasappImageProduct',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('max_width', models.IntegerField(verbose_name='maxWidth')),
                ('left', models.IntegerField(verbose_name='left')),
                ('top', models.IntegerField(verbose_name='top')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalogImages.catalogimage', verbose_name='products')),
                ('whatsapp_message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='msCrm.mscrmwhatsappmessage', verbose_name='whatsappMessage')),
            ],
        ),
    ]
