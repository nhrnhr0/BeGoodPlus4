import time
from django.http import JsonResponse
from catalogImages.models import CatalogImage

from clientApi.serializers import ImageClientApi
from .models import ShareableCart
from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt


@api_view(['POST'])
@permission_classes((AllowAny,))
@csrf_exempt
def create_shareable_cart(request):
    if request.method == 'POST':
        # create the ShareableCart and return it's link
        cart = request.data.get('cart')
        info = list(map(lambda x: {
            'id': x['id'], 'amount': x['amount'], 'mentries': x['mentries']}, cart))
        # create the ShareableCart
        shareable_cart = ShareableCart.objects.create(
            data=info, logs=['created by user' + request.user.username])

        # return the link
        return JsonResponse({'link': shareable_cart.get_shareable_link()})


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_shareable_cart(request, uuid):
    if request.method == 'GET':
        # get the ShareableCart and return it's data
        shareable_cart = ShareableCart.objects.get(uuid=uuid)
        shareable_cart.times_used += 1
        shareable_cart.logs.append(
            'used by user' + request.user.username + ' at ' + str(time.time()))
        shareable_cart.save()
        products_ids = list(map(lambda x: x['id'], shareable_cart.data))
        products = CatalogImage.objects.filter(id__in=products_ids)
        products = products.prefetch_related(
            'colors', 'sizes', 'providers', 'varients').select_related('main_public_album', 'main_public_album__topLevelCategory')

        api_data = ImageClientApi(products, many=True, context={
            'request': request
        })

        send_data = []
        for i in range(len(shareable_cart.data)):
            product = shareable_cart.data[i]
            for j in range(len(api_data.data)):
                if product['id'] == api_data.data[j]['id']:
                    api_data.data[j]['amount'] = product['amount']
                    api_data.data[j]['mentries'] = product['mentries']
                    send_data.append(dict(api_data.data[j]))
                    break

        return JsonResponse({'data': send_data})
    pass
