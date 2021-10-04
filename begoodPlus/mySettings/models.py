from django.db import models

# Create your models here.
class MySettings(models.Model):
    name = models.CharField(max_length=50, unique=True)
    value = models.CharField(max_length=100)