from django.contrib import admin
from adminsortable.admin import SortableAdmin, SortableTabularInline
# Register your models here.
from .models import MonthCampain, CampainProduct, PriceTable, PaymantType


class ProductInline(admin.TabularInline):
    model = MonthCampain.products.through
    filter_horizontal = ('priceTable',)
    extra = 1


class MonthCampainAdmin(admin.ModelAdmin):
    # is_shown,name,users,startTime,endTime,products,album
    list_display = ('name', 'can_users_see_campain', 'is_shown',
                    'startTime', 'endTime', 'show_users', 'album', 'show_products')
    #inlines = [ProductInline]
    actions = ['copy_to_empty_campain']
    filter_horizontal = ('users',)  # 'products',)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['my_data'] = {'object_id': object_id, 'name': 'test'}
        return super(MonthCampainAdmin, self).change_view(
            request, object_id, form_url, extra_context=extra_context,
        )

    def copy_to_empty_campain(self, request, queryset):
        for campain in queryset:
            campain.copy_to_empty_campain()
        self.message_user(request, 'Campains copied')
    copy_to_empty_campain.short_description = 'Copy to empty campain'


    #autocomplete_fields = ('catalogImage',)
admin.site.register(MonthCampain, MonthCampainAdmin)


class CampainProductAdmin(admin.ModelAdmin):
    #autocomplete_fields = ('catalogImage','priceTable',)
    # search_fields = ('catalogImage__title', 'priceTable__price',
    #                'priceTable__paymentType__text',
    #                'priceTable__amountBrakepoint__text',
    #                'priceTable__amountBrakepoint__number',)
    pass


admin.site.register(CampainProduct, CampainProductAdmin)


class PriceTableAdmin(admin.ModelAdmin):
    #search_fields = ('amountBrakepoint__text',)
    #search_fields = ('paymentType__text','amountBrakepoint__text', 'amountBrakepoint__number',)
    pass


admin.site.register(PriceTable, PriceTableAdmin)
