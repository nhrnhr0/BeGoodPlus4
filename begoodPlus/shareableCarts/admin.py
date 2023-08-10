from django.contrib import admin

from shareableCarts.models import ShareableCart
from django.utils.html import mark_safe
# Register your models here.


class ShareableCartAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'created_at', 'times_used',
                    'get_shareable_link_display',)
    readonly_fields = ('uuid', 'created_at', 'times_used',
                       'logs', 'get_shareable_link_display')

    def get_shareable_link_display(self, obj):
        return mark_safe('<a href="%s">%s</a>' % (obj.get_shareable_link(), 'link'))


admin.site.register(ShareableCart, ShareableCartAdmin)
