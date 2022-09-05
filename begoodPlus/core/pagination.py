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
    
    
    def _get_position_from_instance(self, instance, ordering):
        field_name = ordering[0].lstrip('-')
        splited_fields_name = field_name.split('__')
        if isinstance(instance, dict):
            attr = instance[field_name]
        else:
            inst = instance
            for field_n in splited_fields_name:
                inst = getattr(inst, field_n)
        return str(inst)
