
import json
from django.core.management.base import BaseCommand
from myLogo.models import MyLogoCategory,  MyLogoProduct

def get_all_products(category):
    all_products = []
    try:
        for catalog in category['catalogs']:
            #all_products += catalog['products']
            all_products += get_all_products(catalog)
    except:
        #print('no sub catalogs')
        pass
    all_products += category['products']
    #print('get_all_products', all_products)
    return all_products

class Command(BaseCommand):
    
    def handle(self, *args, **options):
        

        with open(r'C:\Users\דאלי\Desktop\roni\BeGoodPlus3\begoodPlus\core\management\commands\mylogo_data.json') as f:
            data = json.load(f)
        #print(data)
        category_count = 0
        new_category_count = 0
        for category in data:
            #print(category)
            img = category['img']
            title = category['title']
            url = category['url']
            url = url.replace('http://www.my-logo.co.il', '/my-logo')
            dbCategory, created = MyLogoCategory.objects.get_or_create(img=img, title=title,url=url)
            category_count += 1
            if created:
                new_category_count += 1
            products = []
            products = get_all_products(category)
            prod_count = 0
            new_prod_count = 0
            for product in products:
                prod_img = product['img']
                prod_title = product['caption']
                prod_makat = product['makat']
                prod_description = product['content']
                prod_url = product['url']
                prod_url = prod_url.replace('http://www.my-logo.co.il', '/my-logo')
                dbProduct, prod_created = MyLogoProduct.objects.get_or_create(img=prod_img, title=prod_title, url=prod_url, makat=prod_makat, description=prod_description)
                #dbProduct.album_set.add(dbCategory)
                dbCategory.products.add(dbProduct)
                prod_count += 1
                if prod_created:
                    new_prod_count += 1
            
            print(title, prod_count, '(', new_prod_count, ')')


    
    