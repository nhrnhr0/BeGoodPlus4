from django.core.management.base import BaseCommand
from django.utils import timezone
import json
from product.models import Product
from category.models import Category
from productImages.models import ProductImage
from django.core.files import File
import time

class Command(BaseCommand):
    help = 'Displays current time'

    def handle(self, *args, **kwargs):
        #start_time = time.time()


        with open('outoutfile.json') as json_file:
            data = json.load(json_file)
            #print(data)
            i= 0
            for product in data:
                print(i)
                #print(product)
                title = product['title']
                description = product['description']
                category = product['category']
                try:
                    categoryObj = Category.objects.get(title=category)
                except:
                    categoryObj = Category(title=category, catalog_rep='A')
                    categoryObj.save()
                #dbProduct = Product(name= title,content=(description or ''), category=categoryObj)
                dbProductList = Product.objects.filter(name=title, category=categoryObj)
                dbProduct = dbProductList.first()
                if dbProduct == None:
                    dbProduct = Product(category=categoryObj, name=title, content =(description or ''),buy_cost=0)
                    print('creating new product ', dbProduct.name, 'description: ', dbProduct.content)
                else:
                    dbProduct.content = description or ''
                    print('updating product ', dbProduct.name, 'description: ', dbProduct.content)
                
                
                #print(dbProduct.name)
                #print(dbProduct.content)
                #print(dbProduct.category)
                dbProduct.save()

                if 'image1' in product:
                    dbImage1 = ProductImage(product=dbProduct)
                    with open(product['image1'], 'rb') as f:
                        image_data = File(f)
                        dbImage1.image.save(product['image1'], image_data, True)
                    dbImage1.save()

                if 'image2' in product:
                    dbImage1 = ProductImage(product=dbProduct)
                    with open(product['image2'], 'rb') as f:
                        image_data = File(f)
                        dbImage1.image.save(product['image2'], image_data, True)
                    dbImage1.save()

                colors = []
                if 'צבע' in product:
                    colors = product['צבע']
                else:
                    colors = ['no color']

                sizes = []
                if 'גודל' in product:
                    sizes = product['גודל']
                else:
                    sizes = ['one size']
                import itertools
                productStuckList = list(itertools.product(colors,sizes))
                #print(productStuckList)

                from provider.models import Provider
                
                try:
                    defultProvider = Provider.objects.all()[0]
                except:
                    defultProvider = Provider(name='defult provider')
                    defultProvider.save()


                from packingType.models import PackingType
                try:
                    defultPackingType = PackingType.objects.all()[0]
                except:
                    defultPackingType = PackingType(name='defult packing')
                    defultPackingType.save()

                for stock in productStuckList:
                    from stock.models import Stock

                    from productSize.models import ProductSize
                    dbProductSize = None
                    try:
                        dbProductSize = ProductSize.objects.get(size=stock[1])
                    except:
                        dbProductSize = ProductSize(size=stock[1])
                        dbProductSize.save()
                    
                    from productColor.models import ProductColor
                    dbProductColor = None
                    try:
                        dbProductColor = ProductColor.objects.get(name=stock[0])
                    except:
                        dbProductColor = ProductColor(name=stock[0])
                        dbProductColor.save()
                        

                    stock, created = Stock.objects.update_or_create(provider=defultProvider, productSize=dbProductSize, productColor=dbProductColor, product=dbProduct, packingType=defultPackingType)
                    print(created, stock.product, stock.productSize, stock.productColor)
                    stock.save()





            
                i+=1

        #end_time = time.time()
        #print('imported in ' + (end_time - start_time) + ' seconds' )

        pass