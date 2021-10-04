from django.shortcuts import render

# Create your views here.
def websites_page_view(request):
    return render(request, 'websites.html', {})