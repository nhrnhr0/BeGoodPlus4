from audioop import reverse
from django.http import HttpResponseRedirect
from django.shortcuts import render

from inventory.models import DocStockEnter
from inventory.serializers import DocStockEnterSerializer
# Create your views here.
def doc_stock_enter(request, id):
    # if the user is not superuser:
    #   redirect to login page
    if not request.user.is_superuser:
        return HttpResponseRedirect(reverse('admin:index'))
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'doc_stock_enter.html', context=context)

def get_enter_doc_data(request, docId):
    # if the user is not superuser:
    #   return error
    doc = DocStockEnter.objects.get(id=docId)

from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import permissions
class DocStockEnterViewSet(RetrieveUpdateDestroyAPIView):
    queryset = DocStockEnter.objects.all().prefetch_related('items', 'items__sku', 'items__sku__ppn','items__sku__size','items__sku__size', 'items__sku__color','items__sku__verient', 'items__sku__ppn__provider','items__sku__ppn__product',)
    serializer_class = DocStockEnterSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "id"
    