# Generated by Django 3.1 on 2022-08-25 12:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0032_auto_20220823_1244'),
    ]

    operations = [
        migrations.AlterField(
            model_name='morder',
            name='email',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='morder',
            name='name',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='morder',
            name='phone',
            field=models.CharField(blank=True, default='', max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='morder',
            name='status',
            field=models.CharField(choices=[('new', 'חדש'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט'), ('in_progress3', 'ארוז מוכן למשלוח'), ('in_progress4', 'בהדפסה'), ('done', 'סופק')], default='new', max_length=100),
        ),
    ]