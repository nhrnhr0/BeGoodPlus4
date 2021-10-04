from django.db import models


from django.utils.translation import gettext_lazy  as _

# Create your models here.
class FreeFlowClient(models.Model):
    name = models.CharField(max_length=100,verbose_name=_('name'))
    email = models.EmailField(verbose_name=_('email'))
    phone = models.CharField(max_length=50, verbose_name=_('telephone'))
    country = models.CharField(max_length=50, verbose_name=_('country'))
    message = models.CharField(max_length=200, verbose_name=_('message'))
    privatePerson = models.BooleanField(verbose_name=_("is private person"),default=True)
    create_date = models.DateTimeField(verbose_name=_("create date"), auto_now_add=True)
    
    
class FreeFlowContent(models.Model):
    heroH3 = models.CharField(max_length=100)
    heroH1 = models.CharField(max_length=100)
    heroH2 = models.CharField(max_length=200)
    heroBtn = models.CharField(max_length=50)
    
    aboutTitle = models.CharField(max_length=150)
    aboutP = models.CharField(max_length=100)
    aboutItem1Title = models.CharField(max_length=100)
    aboutItem1Description = models.CharField(max_length=500)
    aboutItem2Title = models.CharField(max_length=100)
    aboutItem2Description = models.CharField(max_length=500)
    aboutItem3Title = models.CharField(max_length=100)
    aboutItem3Description = models.CharField(max_length=500)

    nav_Home = models.CharField(max_length=100)
    nav_AboutUs = models.CharField(max_length=100)
    nav_BenefitsAdvantages = models.CharField(max_length=100)
    nav_Videos = models.CharField(max_length=100)
    nav_ContactUs = models.CharField(max_length=100)

class FreeFlowStores(models.Model):
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()
    img = models.ImageField()
    url = models.URLField()