from django.shortcuts import render

# Create your views here.
def doc_stock_enter(request, id):
    context = {}
    context['my_data'] = {'id': id}
    return render(request, 'doc_stock_enter.html', context=context)