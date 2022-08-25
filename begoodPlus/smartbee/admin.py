from datetime import timezone
from django.contrib import admin

from smartbee.models import SmartbeeResults, SmartbeeTokens
from datetime import datetime
from django.utils.safestring import mark_safe

import pytz
# Register your models here.
class SmartbeeResultsAdmin(admin.ModelAdmin):
    list_display = ('morder', 'resultCodeId', 'result', 'validationErrors', 'display_link')
    list_filter = ('morder', 'resultCodeId')
    search_fields = ('morder', 'resultCodeId')
    ordering = ('morder', 'resultCodeId')
    readonly_fields = ('morder', 'resultCodeId', 'result', 'validationErrors', 'display_link',)
    
    def display_link(self, obj):
        return mark_safe('<a href="/get-smartbee-doc/' + obj.result + '" >למידע</a>')
admin.site.register(SmartbeeResults, SmartbeeResultsAdmin)

class SmartbeeTokensAdmin(admin.ModelAdmin):
    list_display= ('id', 'created_at', 'expirationUtcDate', 'is_active')
    list_filter = ('created_at', 'expirationUtcDate')
    search_fields = ('id', 'created_at', 'expirationUtcDate')
    ordering = ('created_at', 'expirationUtcDate')
    readonly_fields = ('id', 'created_at', 'expirationUtcDate', 'is_active')
    
    def is_active(self, obj):
        

        return obj.expirationUtcDate >= datetime.now(pytz.timezone('Asia/Jerusalem'))
admin.site.register(SmartbeeTokens, SmartbeeTokensAdmin)
    