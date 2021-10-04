from django.db import models

# Create your models here.
class MyLogoCategory(models.Model):
    img = models.CharField(max_length=100)
    title = models.CharField(max_length=250)
    url = models.URLField()
    products = models.ManyToManyField(to='MyLogoProduct', related_name='album')
    def __str__(self):
        return self.title

class MyLogoProduct(models.Model):
    img = models.CharField(max_length=100)
    title = models.CharField(max_length=250)
    makat = models.CharField(max_length=100)
    description = models.TextField()
    url = models.URLField()

    def __str__(self):
        return self.title

