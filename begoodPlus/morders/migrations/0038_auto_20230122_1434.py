# Generated by Django 3.1 on 2023-01-22 12:34

from django.db import migrations


def update_morders_status2_based_on_status(apps, schema_editor):
    STATUS_CHOICES = [('new', 'חדש'), ('price_proposal', 'הצעת מחיר'), ('in_progress', 'סחורה הוזמנה'), ('in_progress2', 'מוכן לליקוט',), (
        'in_progress3', 'בהדפסה',), ('in_progress4', 'מוכן בבית דפוס'), ('in_progress5', 'ארוז מוכן למשלוח'), ('done', 'סופק'), ]
    Order = apps.get_model('morders', 'MOrder')
    MorderStatus = apps.get_model('morders', 'MorderStatus')
    for order in Order.objects.all():
        new_status = order.status
        if new_status:
            new_status = list(
                filter(lambda x: x[0] == new_status, STATUS_CHOICES))
            if new_status:
                new_status = new_status[0][1]
            if new_status:
                # obj, created = MorderStatus.objects.get_or_create(
                #     name=new_status)
                try:
                    obj = MorderStatus.objects.get(name=new_status)
                except MorderStatus.DoesNotExist:
                    if MorderStatus.objects.count() == 0:
                        last_ordered = 0
                    else:
                        last_ordered = MorderStatus.objects.last().sort_order
                    obj = MorderStatus.objects.create(
                        name=new_status, sort_order=last_ordered+1)
                order.status2 = obj
                order.save()


class Migration(migrations.Migration):

    dependencies = [
        ('morders', '0037_auto_20230122_1433'),
    ]

    operations = [
        migrations.RunPython(update_morders_status2_based_on_status)
    ]
