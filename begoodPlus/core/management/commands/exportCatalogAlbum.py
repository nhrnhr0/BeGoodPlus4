
from django.core.management.base import BaseCommand
import json
from catalogAlbum.models import CatalogAlbum
class Command(BaseCommand):
    def handle(self, *args, **options):
        
        all = CatalogAlbum.objects.all()
        albums = []
        for a in all:
            imgs = []
            for img in a.images.all():
                colors = []
                for color in img.colors.all():
                    img_color = {
                        'type':'color',
                        'id':color.id,
                        'name':color.name,
                        'clr':color.color,
                    }
                    colors.append(img_color)
                
                sizes = []
                for size in img.sizes.all():
                    img_size = {
                        'type':'size', 
                        'id':size.id,
                        'size':size.size,
                        'code': size.code,
                    }
                    sizes.append(img_size)
                
                img_data = {
                    'type':'image',
                    'id': img.id,
                    'title': img.title,
                    'description':img.description,
                    'url': img.image.url,
                    'colors': colors,
                    'sizes': sizes,
                }
                imgs.append(img_data)
                pass # images loop
            d = {
                'type':'album',
                'id':a.id,
                'title': a.title,
                'slug': a.slug,
                'description': a.description,
                'fotter': a.fotter,
                'keywords':a.keywords,
                'images': imgs
            }
            albums.append(d)
            #print(d)
        #data = json.dumps(albums)
        #print(json_dump)
        with open('catalogAlbumExp.json', 'w') as outfile:
            json.dump(albums, outfile)
        print('done')
        pass