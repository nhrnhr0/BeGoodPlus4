from django.db import models
from django.contrib.sessions.models import Session
from django.utils.translation import gettext_lazy  as _

# Create your models here.

class UserTask(models.Model):
    #session = models.ForeignKey(Session, on_delete=models.SET_NULL, blank=True, null=True)
    session = models.CharField(max_length=41, blank=True, null=True)
    task_name = models.CharField(max_length=120, blank=True, null=True)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    modified_date = models.DateTimeField(auto_now=True, blank=True, null=True)
    submited = models.BooleanField(default=False)
    class Meta:
        #unique_together = ('task_name', 'session','submited','created_date')
        pass

class ContactFormTask(UserTask):
    name = models.CharField(verbose_name=_('name'), max_length=50, blank=True, null=True)
    phone = models.CharField(verbose_name=_("phone"), max_length=30, blank=True, null=True)
    email = models.EmailField(verbose_name=_('email'), max_length=120, blank=True, null=True)
    message = models.TextField(verbose_name=_('message'), max_length=1500, blank=True, null=True)
    url = models.CharField(max_length=300)

from catalogImages.models import CatalogImage
class ProductsTask(UserTask):
    name = models.CharField(verbose_name=_('name'), max_length=50, blank=True, null=True)
    phone = models.CharField(verbose_name=_("phone"), max_length=30, blank=True, null=True)
    email = models.EmailField(verbose_name=_('email'), max_length=120, blank=True, null=True)
    products = models.ManyToManyField(to=CatalogImage)

#class UserTasks(models.Model):
    
#    tasks = models.ManyToManyField(to=UserTask)

