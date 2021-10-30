

from django.core.management.base import BaseCommand
from catalogLogos.models import CatalogLogo

class Command(BaseCommand):
    
    def handle(self, *args, **options):
        objs = CatalogLogo.objects.all()
        i = 0
        for o in objs:
            print(i, ') ', end='')
            o.save()
            print(o.id, ' = ', o.title, ' = ', o.cimg)
            
            i+=1