

from django.core.management.base import BaseCommand
from catalogImages.models import CatalogImage

class Command(BaseCommand):
    
    def handle(self, *args, **options):
        objs = CatalogImage.objects.all()
        i = 0
        for o in objs:
            print(i, ') ', end='')
            o.save()
            print(o.id, ' = ', o.title, ' = ', o.cimage)
            
            i+=1