from django.contrib import admin
from .models import MySettings
# Register your models here.
class MySettingsAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'value')

admin.site.register(MySettings, MySettingsAdmin)