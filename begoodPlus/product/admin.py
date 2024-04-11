# from django.contrib import admin
#from .models import Product

#from productImages.models import ProductImage
# from django.utils.html import mark_safe
# from django.conf import settings
# from django.utils.translation import gettext_lazy  as _
# from django.contrib import messages 
# from django.db.models import Prefetch
# class productImageInline(admin.TabularInline):
#     #fields = ('render_image',)
#     model = ProductImage
#     fields = ('image', 'render_image',)
#     readonly_fields = ('render_image',)

#     extra = 0
    
#     show_change_link = True

#     def render_image(self, obj):
#         ret = ''
#         ret += '<img src="%s" width="150" height="150" />' % (settings.MEDIA_URL + obj.image.name) 
#         return mark_safe(ret)

# from stock.models import Stock
# class stockInline(admin.TabularInline):
#     def get_queryset(self, request):
#         qs = super(stockInline, self).get_queryset(request)
#         qs = qs.select_related('product','provider','productSize','productColor','packingType')
#         return qs
#     fields = ('provider','productSize', 'productColor', 'packingType', 'providerMakat', 'amount', 'provider_has_stock', 'provider_resupply_date','inst_client_range','const_sing_client',) # 'const_inst_client_min','const_inst_client_max','
#     #readonly_fields = ('provider', 'productSize','productColor','packingType','providerMakat',)
#     readonly_fields = ('inst_client_range',)
#     model = Stock
#     extra = 0
    
#     show_change_link = True

# from glofa_types.models import GlofaType
# class GlofaTypeInline(admin.StackedInline):
#     def get_queryset(self, request):
#         qs = super(GlofaTypeInline, self).get_queryset(request)
#         qs = qs.select_related('product',)
#         #qs = qs.prefetch_related('supportedProducts',)
#         return qs
#     model = Product.supportedProducts.through
#     fields = ()


# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('name', 'barcode', 'category','customer_catalog_gen',  'total_amount','render_image','suport_printing', 'suport_embroidery',)
#     readonly_fields = ('id', 'category_index','customer_catalog_gen','total_amount',)
#     list_select_related = ('category',)
#     list_filter = ('category','suport_printing', 'suport_embroidery',)
#     autocomplete_fields  = ('catalog_images',)
#     inlines = [productImageInline, GlofaTypeInline, stockInline] # productColorInline
    
#     fieldsets = (
#         (None, {
#             "fields": (
#                 ('id','category_index'), 
#                 'customer_catalog_gen',
#                 'name', 'category','barcode',
#                 'catalog_images',
#                 ('suport_printing', 'suport_embroidery'),
#                 'content','comments',
#             ),
#         }),
#     )
#     def get_queryset(self, request):
#         qs = super(ProductAdmin, self).get_queryset(request)
#         from django.db.models import Sum
#         qs = qs.select_related('category')
#         qs = qs.prefetch_related('images', 'stocks')
#         qs = qs.annotate(stocks_totalamount =Sum('stocks__amount') )
#         #qs = Product.objects.select_related('category').prefetch_related('images','stocks')
        
#         return qs
    
#     #exclude = ('category_index',)
#     #inlines = [productImageInline,stockInline] # productColorInline
    
    
#     search_fields = ('name', 'category__title',)
#     #def get_search_results(self, request, queryset, search_term):
#         #new_queryset, use_distinct = super().get_search_results(request, queryset, search_term)
#         # adding to the original search. search by "customer_catalog_gen"
#         #for p in queryset:
#         #    if search_term in p.customer_catalog_gen() and p not in new_queryset:
#         #        new_queryset |= Product.objects.filter(pk=p.pk)
#         #return new_queryset, use_distinct
        


#     def make_prining_active(modeladmin, request, queryset):
#         queryset.update(suport_printing = True)
#         messages.success(request, _(str(len(queryset)) + " Selected Record(s) Marked as Active pringing Successfully"))
#     make_prining_active.short_description = _('make prining active')
        
#     def make_embroidery_active(modeladmin, request, queryset):
#         queryset.update(suport_embroidery = True)
#         messages.success(request, _(sre(len(queryset)) + " Selected Record(s) Marked as Active embroidery Successfully"))
#     make_embroidery_active.short_description = _('make embroidery active')
        
#     def make_prining_inactive(modeladmin, request, queryset):
#         queryset.update(suport_printing = False)
#         messages.success(request, _(str(len(queryset)) + " Selected Record(s) Marked as Inactive pringing Successfully"))
#     make_prining_inactive.short_description = _('make prining inactive')
        
#     def make_embroidery_inactive(modeladmin, request, queryset):
#         queryset.update(suport_embroidery = False)
#         messages.success(request, _(str(len(queryset)) + " Selected Record(s) Marked as Inactive embroidery Successfully"))
#     make_embroidery_inactive.short_description = _('make embroidery inactive')
        
#     #admin.site.add_action(make_prining_active, _("Make pringing active"))
#     #admin.site.add_action(make_prining_active, _("Make pringing active"))
#     #admin.site.add_action(make_prining_inactive, _("Make pringing inactive"))
#     #admin.site.add_action(make_embroidery_inactive, _("Make embroidery inactive"))
    
#     actions = ('make_prining_active','make_embroidery_active','make_prining_inactive', 'make_embroidery_inactive',)
    
# admin.site.register(Product,ProductAdmin)