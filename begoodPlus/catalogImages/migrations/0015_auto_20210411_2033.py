# Generated by Django 3.0.8 on 2021-04-11 17:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0014_auto_20210407_0926'),
    ]

    operations = [
        migrations.AlterField(
            model_name='catalogimage',
            name='discount',
            field=models.CharField(blank=True, choices=[('', 'ללא הנחה'), ('/static/assets/catalog/imgs/discount_10.gif', '10% הנחה'), ('/static/assets/catalog/imgs/discount_20.gif', '20% הנחה')], default='', max_length=50, null=True),
        ),
    ]
