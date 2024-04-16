from django.contrib import admin

from shareableCarts.models import ShareableCart

# Register your models here.


class ShareableCartAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'created_at', 'times_used')
    readonly_fields = ('uuid', 'created_at', 'times_used', 'logs')


# admin.site.register(ShareableCart, ShareableCartAdmin)
