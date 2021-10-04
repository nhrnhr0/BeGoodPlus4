from django.shortcuts import render

# Create your views here.
from .models import Color
from .serializers import ColorSerializer, SvelteColorSerializer
from rest_framework import viewsets
class ColorsViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class SvelteColorsViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = SvelteColorSerializer
    