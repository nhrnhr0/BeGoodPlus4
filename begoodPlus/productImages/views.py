from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .serializers import ProductImageSerializer
from .models import ProductImage


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()#.order_by('id')
    serializer_class = ProductImageSerializer