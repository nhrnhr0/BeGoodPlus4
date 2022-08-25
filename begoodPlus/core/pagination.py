from rest_framework.pagination import PageNumberPagination
from rest_framework import pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
class CurserResultsSetPagination(pagination.CursorPagination):
    page_size = 100#150
    page_size_query_param = 'page_size'
    max_page_size = 1000
    ordering = '-id'