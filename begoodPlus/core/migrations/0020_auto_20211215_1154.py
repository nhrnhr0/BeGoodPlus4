# Generated by Django 3.1 on 2021-12-15 09:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0036_auto_20211031_1249'),
        ('core', '0019_delete_userlogentry'),
    ]

    operations = [
        migrations.AddField(
            model_name='sveltecartmodal',
            name='message',
            field=models.TextField(blank=True, null=True, verbose_name='message'),
        ),
        migrations.CreateModel(
            name='SvelteCartProductEntery',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField(default=1, verbose_name='amount')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalogImages.catalogimage')),
            ],
        ),
        migrations.AddField(
            model_name='sveltecartmodal',
            name='productEntries',
            field=models.ManyToManyField(blank=True, to='core.SvelteCartProductEntery'),
        ),
    ]
