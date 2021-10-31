from django.core.management.base import BaseCommand
from catalogImages.models import CatalogImage
from catalogLogos.models import CatalogLogo

class Command(BaseCommand):
    
    def handle(self, *args, **options):
        images = CatalogImage.objects.all()
        for img in images:
            if(img.cimage == None):
                #print(img, ' > cimage is none')
                pass
            else:
                if(img.cimage.startswith('http')):
                    newLink = img.cimage.replace('https://res.cloudinary.com/ms-global/image/upload/', '');
                    newLink = newLink.replace('http://res.cloudinary.com/ms-global/image/upload/', '');
                    img.cimage = newLink
                    img.save()
                    print(img)
                    
                    
        logos = CatalogLogo.objects.all()
        for logo in logos:
            if logo.cimg == None:
                pass
            else:
                if(logo.cimg.startswith('http')):
                    newLink = logo.cimg.replace('https://res.cloudinary.com/ms-global/image/upload/', '');
                    newLink = newLink.replace('http://res.cloudinary.com/ms-global/image/upload/', '');
                    logo.cimg = newLink
                    logo.save()
                    print(logo)