from django.shortcuts import render
from django.http import HttpResponse

from clientImages.models import ClientImage
# Create your views here.
def upload_user_image(request):
    if request.method == 'POST':
        my_file = request.FILES.get('file')
        img = ClientImage.objects.create(image=my_file)
        
        
        return HttpResponse(img.image.url);