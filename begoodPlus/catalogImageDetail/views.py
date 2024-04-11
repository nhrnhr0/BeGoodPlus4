# from catalogImageDetail.models import CatalogImageDetail
# from catalogImageDetail.serializers import CatalogImageDetailApiSerializer
# from django.shortcuts import render
# from rest_framework import viewsets
# from django.utils.decorators import method_decorator
# from rest_framework.decorators import api_view, permission_classes

# from django.views.decorators.csrf import csrf_exempt
# # Create your views here.

# class SvelteCatalogImageDetailViewSet(viewsets.ModelViewSet):
#     @method_decorator(csrf_exempt)
#     def dispatch(self, *args, **kwargs):
#         return super(SvelteCatalogImageDetailViewSet, self).dispatch(*args, **kwargs)
#     queryset = CatalogImageDetail.objects.all()
#     serializer_class = CatalogImageDetailApiSerializer