from django.contrib import admin
from .models import ClientImage
# Register your models here.
class ClientImagesAdmin(admin.ModelAdmin):
    list_display = ('image', 'get_absolute_image_url',)
    
admin.site.register(ClientImage, ClientImagesAdmin)