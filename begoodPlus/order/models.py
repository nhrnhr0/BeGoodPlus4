from django.db import models
from django.utils.translation import gettext_lazy  as _

'''
ORDER_STATUS_OPTIONS = [
    ('un', 'undeffied')
    ('F1', 'Form step 1'),
    ('F2', 'Form step 2'),
    ('F3', 'Form step 3'),
    
]'''

# Create your models here.
class Order(models.Model):
    class Meta:
        verbose_name = _('Order')
        verbose_name_plural = _('Orders')
    
    submit_date = models.DateField(verbose_name=_("submit date"), auto_now=True)
    client_name = models.CharField(verbose_name=_("client name"), max_length=50, blank=False, null=False)
    private_compeny = models.CharField(verbose_name=_("private compeny"), max_length=50)
    addres = models.CharField(verbose_name=_("addres"), max_length=100)
    telephone = models.CharField(verbose_name=_("telephone"), max_length=20)
    email = models.EmailField(verbose_name=_("email"))
    contact_man = models.CharField(verbose_name=_("contact man"), max_length=50)
    cellphone = models.CharField(verbose_name=_("cellphone"), max_length=20)
    #status = models.CharField(max_length=2,
    #    choices=ORDER_STATUS_OPTIONS)
    # TODO provider to Z