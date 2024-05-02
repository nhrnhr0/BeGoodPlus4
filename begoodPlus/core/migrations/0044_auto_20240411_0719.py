# Generated by Django 3.1 on 2024-04-11 04:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0043_delete_sveltecartmodal'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customer',
            name='carts',
        ),
        migrations.RemoveField(
            model_name='customer',
            name='contact',
        ),
        migrations.DeleteModel(
            name='ProvidersDocxTask',
        ),
        migrations.RemoveField(
            model_name='sveltecartproductentery',
            name='product',
        ),
        migrations.RemoveField(
            model_name='sveltecontactformmodal',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userproductphoto',
            name='user',
        ),
        migrations.DeleteModel(
            name='BeseContactInformation',
        ),
        migrations.DeleteModel(
            name='Customer',
        ),
        migrations.DeleteModel(
            name='SvelteCartProductEntery',
        ),
        migrations.DeleteModel(
            name='SvelteContactFormModal',
        ),
        migrations.DeleteModel(
            name='UserProductPhoto',
        ),
    ]