from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from .serializers import AdminMOrderSerializer
from morders.models import MOrder
from rest_framework import status

# Create your views here.
def edit_morder(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'morder_edit.html', context=context)


def api_get_order_data(request, id):
    if not request.user.is_superuser:
        return JsonResponse({'status':'error'}, status=status.HTTP_403_FORBIDDEN)
    order = MOrder.objects.select_related('client').get(id=id)
    data = AdminMOrderSerializer(order).data
    return JsonResponse(data, status=status.HTTP_200_OK)
    