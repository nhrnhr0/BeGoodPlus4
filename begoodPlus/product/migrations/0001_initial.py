# Generated by Django 3.0.8 on 2020-11-12 12:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120, verbose_name='שם')),
                ('category_index', models.IntegerField()),
                ('buy_cost', models.PositiveSmallIntegerField(verbose_name='מחיר עלות')),
                ('const_inst_client_min', models.IntegerField(default=0, null=True, verbose_name='מחיר לקוח מוסדי ללא מע"מ מ')),
                ('const_inst_client_max', models.IntegerField(default=0, null=True, verbose_name='עד')),
                ('const_sing_client', models.IntegerField(default=0, verbose_name='מחיר לקוח בודד כולל מע"מ')),
                ('suport_printing', models.BooleanField(default=True, verbose_name='תומך בהדפסה')),
                ('suport_embroidery', models.BooleanField(default=True, verbose_name='תומך ברקמה')),
                ('content', models.TextField(blank=True, default='', verbose_name='תוכן')),
                ('comments', models.TextField(blank=True, default='', verbose_name='הערות')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='category.Category', verbose_name='קטגוריה')),
            ],
            options={
                'verbose_name': 'מוצר',
                'verbose_name_plural': 'מוצרים',
                'ordering': ('category',),
            },
        ),
    ]
