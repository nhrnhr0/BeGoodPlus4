from django.contrib import admin
from .models import MOrderItem, MOrder, MOrderItemEntry
import io
from django.contrib import admin
from django.http.response import HttpResponse
from django.utils.translation import gettext_lazy  as _
import zipfile

class MOrderItemEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'color', 'size', 'varient', 'quantity')
    list_filter = ('product', 'color', 'size', 'varient')
    search_fields = ('product', 'color', 'size', 'varient')
admin.site.register(MOrderItemEntry, MOrderItemEntryAdmin)

# Register your models here.
class MOrderItemAdmin(admin.ModelAdmin):
    model = MOrderItem
    list_display = ('id', 'product','price','ergent','prining','embroidery','comment',)
    filter_horizontal = ('providers','entries','morder')
admin.site.register(MOrderItem, MOrderItemAdmin)


class MOrderAdmin(admin.ModelAdmin):
    model = MOrder
    fields = ('cart', 'client', 'name', 'phone', 'email', 'status', 'message', 'products_display',) # what is this for?
    readonly_fields = ('created', 'updated', 'products_display','get_edit_url','view_morder_pdf_link',)
    list_display = ('id', 'client', 'status', 'created', 'updated','get_edit_url', 'view_morder_pdf_link',)
    #filter_horizontal = ('products',)
    actions = ('export_to_excel',)
    
    '''
    def export_to_excel(self, request, queryset):
        filesbuffers = []
        for morder in queryset:
            filesbuffers.append(morder.export_to_excel())
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for d in filesbuffers:
                file_name = d['name'] + '.xls'
                data = d['data']
                zip_file.writestr(file_name , data.getvalue())
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        response['Content-Disposition'] = 'attachment; filename="products.zip"'
        return response
    '''
admin.site.register(MOrder, MOrderAdmin)
