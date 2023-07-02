# Generated by Django 3.1 on 2023-06-12 07:18

from django.db import migrations
from uuid import uuid4


def make_sure_every_color_has_product_color(apps, schema_editor):
    ProductColor = apps.get_model('productColor', 'ProductColor')
    Color = apps.get_model('color', 'Color')
    for color in Color.objects.all():
        try:
            ProductColor.objects.get(id=color.pk)
        except ProductColor.DoesNotExist:
            # get last product color code
            last_product_color = ProductColor.objects.last()
            if last_product_color:
                last_product_color_code = last_product_color.code
                last_product_color_code = int(last_product_color_code, 10)
                last_product_color_code += 1
                last_product_color_code = str(last_product_color_code)
            ProductColor.objects.create(
                id=color.pk,
                name=color.name,
                color=color.color,
                code=last_product_color_code
            )


class Migration(migrations.Migration):

    dependencies = [
        ('catalogImages', '0062_auto_20220902_1104'),
    ]

    operations = [
        migrations.RunPython(make_sure_every_color_has_product_color),
    ]