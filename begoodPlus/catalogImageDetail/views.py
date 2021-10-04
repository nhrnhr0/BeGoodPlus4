from catalogImageDetail.models import CatalogImageDetail
from catalogImageDetail.serializers import CatalogImageDetailApiSerializer
from django.shortcuts import render
from rest_framework import viewsets

# Create your views here.
class SvelteCatalogImageDetailViewSet(viewsets.ModelViewSet):
    queryset = CatalogImageDetail.objects.all()
    serializer_class = CatalogImageDetailApiSerializer