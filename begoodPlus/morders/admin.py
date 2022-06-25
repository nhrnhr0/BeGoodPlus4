import datetime
from django.contrib import admin
from openpyxl import Workbook
from productColor.models import ProductColor

from productSize.models import ProductSize
from .models import MOrderItem, MOrder, MOrderItemEntry
import io
from django.contrib import admin
from django.http.response import HttpResponse
from django.utils.translation import gettext_lazy  as _
import zipfile
from openpyxl.styles import PatternFill

from openpyxl.styles import Alignment
from openpyxl.styles import Font
import copy
from openpyxl.styles.borders import Border, Side
from openpyxl import Workbook



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
    readonly_fields = ('created', 'updated', 'products_display','get_edit_url','view_morder_pdf_link','view_morder_stock_document_link',)
    list_display = ('id', 'client', 'name','status', 'created', 'updated','get_edit_url', 'view_morder_pdf_link','view_morder_stock_document_link',)
    list_editable = ('status',)
    #filter_horizontal = ('products',)
    actions = ('export_to_excel',)
    def export_to_excel(self, request, queryset):
        filesbuffers = []
        
        yellow = "00FFFF00"
        grey = "00808080"
        light_blue = "00FFCCFF"
        header_font = Font(size=10, bold=True,)
        center_align = Alignment(horizontal='center', vertical='center')
        align_rtl = Alignment(horizontal='right', vertical='center')
        header_fill = PatternFill(start_color=light_blue, end_color=light_blue, fill_type='solid')
        
        bottom_border = Border( bottom=Side(style='thin'))
        
        orders = []
        for morder in queryset:
            order_data = morder.get_exel_data()
            orders.append(order_data)
        all_products = {}
        for order in orders:
            name = order['name']
            order_products = order['products']
            for order_product in order_products:
                product_name = order_product['title']
                if product_name not in all_products:
                    all_products[product_name] = {
                        'entries': copy.deepcopy(order_product['entries']),
                        'comment': (name + ': '  + order_product['comment'] + '\n') if order_product['comment'] else '',
                        'barcode': order_product['barcode'],
                        'total_quantity':0 ,
                    }
                else:
                    #all_products[product_name] += product['entries']
                    entries = all_products[product_name]['entries']
                    for entry in order_product['entries'].keys():
                        if entry in entries:
                            entries[entry] += order_product['entries'][entry]
                        else:
                            entries[entry] = order_product['entries'][entry]
                    all_products[product_name]['entries'] = entries
                    
                    all_products[product_name]['comment'] += (name + ': ' +  order_product['comment'] + '\n') if order_product['comment'] else ''
                all_products[product_name]['total_quantity'] += order_product['total_quantity']
            # create total of quantity, total price,   the products by name
            pass
        # current all_products:
        # {'product_name': {('color_name', 'size_name', 'varient_name'): quantity}}
        # create excel file
        # headers:
        # פריט, הערות, ברקוד, כמות כוללת
        # פירוט מידות צבעים
        headers = ['ברקוד','פריט', 'כמות כוללת','הערות']
        

        wb = Workbook()
        main_ws = wb.active
        main_ws.sheet_view.rightToLeft = True
        # text align all the document to center
        # set the width of the columns
        main_ws.column_dimensions['A'].width = 20
        main_ws.column_dimensions['B'].width = 20
        main_ws.column_dimensions['C'].width = 20
        main_ws.column_dimensions['D'].width = 20
        # set the header
        ws_rows_counter = 1
        
        # create sheet for each order
        for order in orders:
            name = order['name']
            order_ws = wb.create_sheet(order['name'] + ' ' + str(order['id']))
            order_ws.sheet_view.rightToLeft = True
            # text align all the document to center
            # set the width of the columns
            order_ws.column_dimensions['A'].width = 20
            order_ws.column_dimensions['B'].width = 20
            order_ws.column_dimensions['C'].width = 20
            order_ws.column_dimensions['D'].width = 20
            order_products = order['products']
            order_ws_rows_counter = 1
            order_ws.cell(row=order_ws_rows_counter, column=1).value = 'מספר הזמנה'
            order_ws.cell(row=order_ws_rows_counter, column=1).font = order_ws.cell(row=order_ws_rows_counter, column=1).font.copy(bold=True)
            order_ws.cell(row=order_ws_rows_counter, column=1).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=2).value = 'תאריך הזמנה'
            order_ws.cell(row=order_ws_rows_counter, column=2).font = order_ws.cell(row=order_ws_rows_counter, column=2).font.copy(bold=True)
            order_ws.cell(row=order_ws_rows_counter, column=2).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=3).value = 'שם הלקוח'
            order_ws.cell(row=order_ws_rows_counter, column=3).font = order_ws.cell(row=order_ws_rows_counter, column=3).font.copy(bold=True)
            order_ws.cell(row=order_ws_rows_counter, column=3).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=4).value = 'הודעה'
            order_ws.cell(row=order_ws_rows_counter, column=4).font = order_ws.cell(row=order_ws_rows_counter, column=4).font.copy(bold=True)
            order_ws.cell(row=order_ws_rows_counter, column=4).alignment = align_rtl
            order_ws_rows_counter += 1
            order_ws.cell(row=order_ws_rows_counter, column=1).value = order['id']
            order_ws.cell(row=order_ws_rows_counter, column=1).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=2).value = order['date']
            order_ws.cell(row=order_ws_rows_counter, column=2).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=3).value = order['name']
            order_ws.cell(row=order_ws_rows_counter, column=3).alignment = align_rtl
            order_ws.cell(row=order_ws_rows_counter, column=4).value = order['message']
            order_ws.cell(row=order_ws_rows_counter, column=4).alignment = align_rtl
            order_ws_rows_counter += 1
            for i in range(len(headers)):
                order_ws.cell(row=order_ws_rows_counter, column=i+1).value = headers[i]
                order_ws.cell(row=order_ws_rows_counter, column=i+1).font = main_ws.cell(row=order_ws_rows_counter, column=i+1).font.copy(bold=True)
            order_ws_rows_counter += 1
            for product in order_products:
                product_name = product['title']
                #order_ws.cell(row=order_ws_rows_counter, column=1).value = product['barcode']
                #order_ws.cell(row=order_ws_rows_counter, column=1).value = product['p']
                order_ws.cell(row=order_ws_rows_counter, column=1).value = product['barcode']
                order_ws.cell(row=order_ws_rows_counter, column=1).fill = header_fill
                order_ws.cell(row=order_ws_rows_counter, column=1).alignment = align_rtl
                order_ws.cell(row=order_ws_rows_counter, column=1).font = header_font
                order_ws.cell(row=order_ws_rows_counter, column=1).border = bottom_border
                
                order_ws.cell(row=order_ws_rows_counter, column=2).value = product_name
                order_ws.cell(row=order_ws_rows_counter, column=2).fill = header_fill
                order_ws.cell(row=order_ws_rows_counter, column=2).alignment = align_rtl
                order_ws.cell(row=order_ws_rows_counter, column=2).font = header_font
                order_ws.cell(row=order_ws_rows_counter, column=2).border = bottom_border
                
                order_ws.cell(row=order_ws_rows_counter, column=3).value = product['total_quantity']
                order_ws.cell(row=order_ws_rows_counter, column=3).fill = header_fill
                order_ws.cell(row=order_ws_rows_counter, column=3).alignment = align_rtl
                order_ws.cell(row=order_ws_rows_counter, column=3).font = header_font
                order_ws.cell(row=order_ws_rows_counter, column=3).border = bottom_border

                order_ws.cell(row=order_ws_rows_counter, column=4).value = product['comment']
                order_ws.cell(row=order_ws_rows_counter, column=4).fill = header_fill
                order_ws.cell(row=order_ws_rows_counter, column=4).alignment = align_rtl
                order_ws.cell(row=order_ws_rows_counter, column=4).font =  header_font
                order_ws.cell(row=order_ws_rows_counter, column=4).border = bottom_border

                order_ws_rows_counter += 1

                
                
                entries = product['entries']
                # entry = ('color_name', 'size_name', 'varient_name', color_order, size_order): quantity
                # sort the entries by color name, size name, varient name based on the order of the colors and sizes
                sorted_entries = sorted(entries.items(), key=lambda x: (x[0][3], x[0][4]))
                if len(sorted_entries) == 1 and sorted_entries[0][0][0] == 'no color' and sorted_entries[0][0][1] == 'ONE SIZE':
                    continue
                sorted_entries = dict(sorted_entries)
                
                for entry in sorted_entries:#product['entries']:
                    # entry = ('color_name', 'size_name', 'varient_name'): quantity
                    color = entry[0]
                    size = entry[1]
                    varient = entry[2]
                    quantity = product['entries'][entry]
                    order_ws.cell(row=order_ws_rows_counter, column=1).value = color
                    order_ws.cell(row=order_ws_rows_counter, column=1).alignment = align_rtl
                    #order_ws.cell(row=order_ws_rows_counter, column=1).font = order_ws.cell(row=order_ws_rows_counter, column=1).font.copy(bold=True)
                    order_ws.cell(row=order_ws_rows_counter, column=2).value = size
                    order_ws.cell(row=order_ws_rows_counter, column=2).alignment = align_rtl
                    #order_ws.cell(row=order_ws_rows_counter, column=2).font = order_ws.cell(row=order_ws_rows_counter, column=2).font.copy(bold=True)
                    order_ws.cell(row=order_ws_rows_counter, column=3).value = varient
                    order_ws.cell(row=order_ws_rows_counter, column=3).alignment = align_rtl
                    #order_ws.cell(row=order_ws_rows_counter, column=3).font = order_ws.cell(row=order_ws_rows_counter, column=3).font.copy(bold=True)
                    order_ws.cell(row=order_ws_rows_counter, column=4).value = quantity
                    order_ws.cell(row=order_ws_rows_counter, column=4).alignment = align_rtl
                    #order_ws.cell(row=order_ws_rows_counter, column=4).font = order_ws.cell(row=order_ws_rows_counter, column=4).font.copy(bold=True)
                    order_ws_rows_counter += 1

            
            # for order_product in order_products:
            #     product_name = order_product['title']

# Add headers in bold
        for i in range(len(headers)):
            main_ws.cell(row=ws_rows_counter, column=i+1).value = headers[i]
            main_ws.cell(row=ws_rows_counter, column=i+1).font = main_ws.cell(row=ws_rows_counter, column=i+1).font.copy(bold=True)
        ws_rows_counter += 1
        for product_name in all_products:
            
            product = all_products[product_name]
            main_ws.cell(row=ws_rows_counter, column=1).value = product['barcode']
            
            #main_ws.cell(row=ws_rows_counter, column=1).font = main_ws.cell(row=ws_rows_counter, column=1).font.copy(bold=True)
            main_ws.cell(row=ws_rows_counter, column=1).fill = header_fill
            main_ws.cell(row=ws_rows_counter, column=1).alignment = align_rtl
            main_ws.cell(row=ws_rows_counter, column=1).font = header_font
            main_ws.cell(row=ws_rows_counter, column=1).border = bottom_border
            
            main_ws.cell(row=ws_rows_counter, column=2).value = product_name
            main_ws.cell(row=ws_rows_counter, column=2).fill = header_fill
            main_ws.cell(row=ws_rows_counter, column=2).alignment = align_rtl
            main_ws.cell(row=ws_rows_counter, column=2).font = header_font
            main_ws.cell(row=ws_rows_counter, column=2).border = bottom_border
            
            main_ws.cell(row=ws_rows_counter, column=3).value = product['total_quantity']
            main_ws.cell(row=ws_rows_counter, column=3).fill = header_fill
            main_ws.cell(row=ws_rows_counter, column=3).alignment = align_rtl
            main_ws.cell(row=ws_rows_counter, column=3).font = header_font
            main_ws.cell(row=ws_rows_counter, column=3).border = bottom_border

            main_ws.cell(row=ws_rows_counter, column=4).value = product['comment']
            main_ws.cell(row=ws_rows_counter, column=4).fill = header_fill
            main_ws.cell(row=ws_rows_counter, column=4).alignment = align_rtl
            main_ws.cell(row=ws_rows_counter, column=4).font =  header_font
            main_ws.cell(row=ws_rows_counter, column=4).border = bottom_border
            
            
            # ws_rows_counter += 1
            # main_ws.cell(row=ws_rows_counter, column=1).value = 'צבע'
            # main_ws.cell(row=ws_rows_counter, column=1).font = main_ws.cell(row=ws_rows_counter, column=1).font.copy(bold=True)
            # main_ws.cell(row=ws_rows_counter, column=1).alignment = align_rtl
            # main_ws.cell(row=ws_rows_counter, column=2).value = 'מידה'
            # main_ws.cell(row=ws_rows_counter, column=2).font = main_ws.cell(row=ws_rows_counter, column=2).font.copy(bold=True)
            # main_ws.cell(row=ws_rows_counter, column=2).alignment = align_rtl
            # main_ws.cell(row=ws_rows_counter, column=3).value = 'ווריאנט'
            # main_ws.cell(row=ws_rows_counter, column=3).font = main_ws.cell(row=ws_rows_counter, column=3).font.copy(bold=True)
            # main_ws.cell(row=ws_rows_counter, column=3).alignment = align_rtl
            # main_ws.cell(row=ws_rows_counter, column=4).value = 'כמות'
            # main_ws.cell(row=ws_rows_counter, column=4).font = main_ws.cell(row=ws_rows_counter, column=4).font.copy(bold=True)
            # main_ws.cell(row=ws_rows_counter, column=4).alignment = align_rtl
            ws_rows_counter += 1
            entries = product['entries']
            # entry = ('color_name', 'size_name', 'varient_name', color_order, size_order): quantity
            # sort the entries by color name, size name, varient name based on the order of the colors and sizes
            sorted_entries = sorted(entries.items(), key=lambda x: (x[0][3], x[0][4]))
            if len(sorted_entries) == 1 and sorted_entries[0][0][0] == 'no color' and sorted_entries[0][0][1] == 'ONE SIZE':
                continue
            sorted_entries = dict(sorted_entries)
            
            for entry in sorted_entries:#product['entries']:
                # entry = ('color_name', 'size_name', 'varient_name'): quantity
                color = entry[0]
                size = entry[1]
                varient = entry[2]
                quantity = product['entries'][entry]
                main_ws.cell(row=ws_rows_counter, column=1).value = color
                main_ws.cell(row=ws_rows_counter, column=1).alignment = align_rtl
                #main_ws.cell(row=ws_rows_counter, column=1).font = main_ws.cell(row=ws_rows_counter, column=1).font.copy(bold=True)
                main_ws.cell(row=ws_rows_counter, column=2).value = size
                main_ws.cell(row=ws_rows_counter, column=2).alignment = align_rtl
                #main_ws.cell(row=ws_rows_counter, column=2).font = main_ws.cell(row=ws_rows_counter, column=2).font.copy(bold=True)
                main_ws.cell(row=ws_rows_counter, column=3).value = varient
                main_ws.cell(row=ws_rows_counter, column=3).alignment = align_rtl
                #main_ws.cell(row=ws_rows_counter, column=3).font = main_ws.cell(row=ws_rows_counter, column=3).font.copy(bold=True)
                main_ws.cell(row=ws_rows_counter, column=4).value = quantity
                main_ws.cell(row=ws_rows_counter, column=4).alignment = align_rtl
                #main_ws.cell(row=ws_rows_counter, column=4).font = main_ws.cell(row=ws_rows_counter, column=4).font.copy(bold=True)
                ws_rows_counter += 1
        
        
        # save file
        
        date = datetime.datetime.now().strftime('%Y-%m-%d')
        filename = f'orders_{date}.xlsx'
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
        wb.save(response)
        return response
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
