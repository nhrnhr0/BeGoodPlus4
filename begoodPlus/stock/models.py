# from django.db import models

# from provider.models import Provider
# from productSize.models import ProductSize
# from productColor.models import ProductColor
# #from product.models import Product

# from django.utils.translation import gettext_lazy  as _
# from packingType.models import PackingType
# Create your models here.
# class Stock(models.Model):
#     class Meta():
#         verbose_name = _('Stock')
#         verbose_name_plural = _('Stocks')
#         default_related_name = 'stocks'
        
#     product = models.ForeignKey(verbose_name=_("product name"), to=Product, on_delete=models.CASCADE)
#     provider = models.ForeignKey(verbose_name=_("product provider"), to=Provider, on_delete=models.CASCADE)
#     productSize = models.ForeignKey( verbose_name=_("size"), to=ProductSize, on_delete=models.CASCADE)
#     productColor = models.ForeignKey(verbose_name=_("color"), to=ProductColor, on_delete=models.CASCADE)
#     packingType = models.ForeignKey(verbose_name=_("packing type"), to=PackingType, on_delete=models.CASCADE)
#     providerMakat = models.CharField(verbose_name=_("provider makat"), max_length=50, blank=True)
#     amount = models.IntegerField(verbose_name=_('stock at us'), default=0)
#     provider_has_stock = models.BooleanField(verbose_name=_("exist at provider"), default=True)
#     provider_resupply_date = models.DateTimeField(verbose_name=_("provider resupply date"), null=True, blank=True)
    
#     buy_cost = models.FloatField(verbose_name=_('buy cost'), default=0)
#     #cost_prices = models.IntegerField(verbose_name=_('cost prices'), null=True, default=0)
#     const_inst_client_min = models.FloatField(verbose_name=_('cost for institucional without tax from'),null=True, default=0)
#     const_inst_client_max = models.FloatField(verbose_name=_('to'),null=True, default=0)
#     const_sing_client = models.FloatField(verbose_name=_('cost for single client with tax'), default=0)
    
#     def buy_cost_tax(self, *args, **kwargs):
#         if self.buy_cost:
#             return self.buy_cost * 1.17
#         else:
#             return 0.0
#     buy_cost_tax.short_description = _("buy const with tax")

#     def inst_client_range(self, *args, **kwargs):
#         return '(' + str(self.const_inst_client_min) + ' - ' +  str(self.const_inst_client_max) + ')'
#     inst_client_range.short_description = _("institutional client price range")

#     def __str__(self):
#         return self.catalog_part()#str(self.id)

#     def catalog_part(self):
#         category_rep = self.product.category.catalog_rep
#         provider_rep = self.provider.code
#         subcat_rep = self.product.catalog_part()
#         size_rep = self.productSize.code
#         color_rep = self.productColor.code
#         product_id = str(self.product.id)
#         return category_rep + provider_rep + subcat_rep + '-' + size_rep + '-' + color_rep + '-' + product_id
#     catalog_part.short_description = _("makat")
    
    

