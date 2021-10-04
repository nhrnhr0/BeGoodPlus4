from django.shortcuts import render

# Create your views here.
from django.views.decorators.clickjacking import xframe_options_exempt

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def landingPageFormSubmit(request):
    if request.method == 'POST' and request.is_ajax():
        print(request)
        name = request.POST.get('fname', None) 
        phone = request.POST.get('phone', None)
        print(name, phone)
        return JsonResponse({'status':'succsess'})
    else:
        return JsonResponse({'status':'fail'})
    
