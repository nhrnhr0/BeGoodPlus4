from django.db import models

# Create your models here.

class TaxReturnCampain(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)