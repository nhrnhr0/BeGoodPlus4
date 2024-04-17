from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from .models import Cart, CartItem, CartItemEntry
from catalogImages.models import CatalogImage, CatalogImageVarient, ProductSize
from django.http import JsonResponse
from .serializers import CartSerializer
from productSize.models import ProductSizeGroup
# Create your views here.


# {'84':{'94':{'1':'quantity':10}}} -> 'color_id': 84 'size_id': 94 'varient': 1 'quantity': 10
# {'77':{'95':{'quantity':10}}} -> 'color_id': 77 'size_id': 95 varient: None 'quantity': 10
# {'87': {'86': {}}} -> 'color_id': 87 'size_id': 86 varient: None 'quantity': None

def convert_mentries_to_entries(mentries):
    entries = []

    for color_id, color_data in mentries.items():
        for size_id, size_data in color_data.items():
            if size_data:  # Check if size_data is not empty
                if 'quantity' in size_data:
                    quantity = size_data['quantity']
                    if quantity:
                        entries.append({
                            'color_id': color_id,
                            'size_id': size_id,
                            'varient': None,  # Assuming varient is not provided in the given data
                            'quantity': quantity
                        })
                else:
                    quantity = None
                    #if size_data is object, then it is a varient, so we need to iterate over it
                    if isinstance(size_data, dict):
                        for varient, varient_data in size_data.items():
                            quantity = varient_data.get('quantity')
                            if quantity:
                                entries.append({
                                    'color_id': color_id,
                                    'size_id': size_id,
                                    'varient': varient,
                                    'quantity': quantity
                                })
                
    return entries


@api_view(['POST'])
@permission_classes((AllowAny,))
def submit_cart(request):
    if(request.method != 'POST'):
        return HttpResponse('Method not allowed', status=405)
    body = request.data
    
    name = body.get('name')
    email = body.get('email')
    phone = body.get('phone')
    privateCompany = body.get('privateCompany')
    # is_order = body.get('is_order', False)
    # is_price_proposal = body.get('is_price_proposal', False)
    order_type_order = body.get('order_type_order', False)
    order_type_offer = body.get('order_type_offer', False)
    order_type_stock = body.get('order_type_stock', False)
    message = body.get('message')
    cart = Cart.objects.create(
        name=name,
        email=email,
        phone=phone,
        privateCompany=privateCompany,
        message=message,
        is_inventory_check=order_type_stock,
        is_order=order_type_order,
        is_price_proposal=order_type_offer,
    )
    
    for product in body.get('products'):
        
        mentries = product.get('mentries')
        entries = convert_mentries_to_entries(mentries)
        cartItem = CartItem.objects.create(product_id=product.get('id'))
        if len(entries) == 0:
            entries.append({
                'color_id': 76, # Assuming default color_id is 76 ON COLOR
                'size_id': 86, # Assuming default size_id is 86 ONE SIZE
                'varient': None, # Assuming default varient is None
                'quantity': product.get('amount', 0)
            })
        for entry in entries:
            cartItemEntry = CartItemEntry.objects.create(
                quantity=entry.get('quantity'),
                color_id=entry.get('color_id'),
                size_id=entry.get('size_id'),
                varient_id=entry.get('varient')
            )
            cartItem.entries.add(cartItemEntry)
        cart.products.add(cartItem)
        
    return JsonResponse({'message': 'Cart submitted successfully',
                            'cart_id': cart.id,
                            'status': 'success',
                            }, status=200)

from .serializers import SizesGroupSerializer

#@api_view(['GET'])
#@permission_classes((AllowAny,))
def display_cart_api(request, id):
    cart = Cart.objects.prefetch_related('products','products__entries','products__product', 'products__entries', 'products__entries__size', 'products__entries__size__group', 'products__entries__color', 'products__entries__varient').get(id=id)
    serializer = CartSerializer(cart)
    
    sizesGroups = ProductSizeGroup.objects.prefetch_related('sizes').all()
    sizesGroupsSerializerData = SizesGroupSerializer(sizesGroups, many=True).data
    sizesGroupsDataDict = {}
    for group in sizesGroupsSerializerData:
        sizesGroupsDataDict[group['id']] = group
    
    return JsonResponse({'cart': serializer.data, 'sizesGroups': sizesGroupsDataDict}, status=200)
