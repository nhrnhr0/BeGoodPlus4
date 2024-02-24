from django.db import models
# from productSize.models import ProductSize
# Create your models here.

class productSizeGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # sizes = models.ManyToManyField(ProductSize, blank=True)

    def __str__(self):
        return self.name
    pass