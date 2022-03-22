from telnetlib import STATUS
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render

from morders.models import MOrder

# Create your views here.
def edit_morder(request, id):
    if not request.user.is_superuser:
        return HttpResponseRedirect('/admin/login/?next=' + request.path)
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'morder_edit.html', context=context)

def api_get_order_data(request, id):
    if not request.user.is_superuser:
        return JsonResponse({'status':'error'}, status=STATUS.HTTP_403_FORBIDDEN)
    order = MOrder.objects.get(id=id)
    return JsonResponse(order.get_data(), safe=False)