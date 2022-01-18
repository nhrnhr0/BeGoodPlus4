
from typing import List
from django.core.management.base import BaseCommand
from catalogAlbum.models import CatalogAlbum
from catalogImages.models import CatalogImage
from client.models import CLIENT_TYPES, Client, ClientType
import csv

from color.models import Color
from productSize.models import ProductSize
from provider.models import Provider

class Command(BaseCommand):
    def handle(self, *args, **options):
        base_dir = './data_analysis'
        # users export:
        
        storeTypes = [[v.id, v.name] for v in ClientType.objects.all()]
        export_csv_table(['id','name'], storeTypes, f'{base_dir}/u.storeTypes.csv')
        
        albums = [[v.id,v.title] for v in CatalogAlbum.objects.all()]
        export_csv_table(['id','title'], albums, f'{base_dir}/g.album.csv')
        
        
        clientType = [[v[0], v[1]] for v in CLIENT_TYPES]
        export_csv_table(['id','name'], clientType, f'{base_dir}/u.clientType.csv')
        
        
        users = [[v.user_id, v.businessName, v.storeType.id, v.clientType, list(v.categorys.values_list('id',flat=True))] for v in Client.objects.all()]
        export_csv_table(['id','businessName','storeType','clientType','categorys'], users, f'{base_dir}/users.csv')
        
        # products export:
        colors = [[v.id, v.name] for v in Color.objects.all()]
        export_csv_table(['id','name'], colors, f'{base_dir}/p.colors.csv')
        
        sizes = [[v.id, v.size] for v in ProductSize.objects.all()]
        export_csv_table(['id','size'], sizes, f'{base_dir}/p.sizes.csv')
        
        providers = [[v.id, v.name] for v in Provider.objects.all()]
        export_csv_table(['id','name'], providers, f'{base_dir}/p.providers.csv')
        
        products = [[v.id, v.title, list(v.providers.values_list('id',flat=True)), list(v.albums.values_list('id',flat=True)), list(v.colors.values_list('id',flat=True)), list(v.sizes.values_list('id',flat=True))] for v in CatalogImage.objects.all()]
        export_csv_table(['id','title','providers','albums','colors','sizes'], products, f'{base_dir}/products.csv')
# export to csv table and add index to each row
def export_csv_table(headers: list, table, filename: str):
    # open with unicode encoding
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile, delimiter=',',
                            quotechar='"', quoting=csv.QUOTE_MINIMAL)
        if not 'idx' in headers:
            headers.insert(0, 'idx')
        writer.writerow(headers)
        for i,row in enumerate(table):
            row.insert(0,str(i))
            writer.writerow(row)
            