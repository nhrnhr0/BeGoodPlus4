from django.shortcuts import render

# Create your views here.
def my_logo_view(request, curr):

    return render(request, 'new_my_logo.html', {'redirect_to': curr} )