from django.shortcuts import render

from django.http import JsonResponse

from glofa_types.models import GlofaType, GlofaImageTypeConnection
# Create your views here.
def glofa_data(request, id):

    glofas = GlofaType.objects.filter(supportedProducts__pk=id)
    glofa_types = GlofaImageTypeConnection.objects.select_related('glofaImage','glofaType').filter(glofaType__in=glofas)
    data = list(glofa_types.values('id', 'cords','shape', 'glofaImage_id','glofaImage__image', 'glofaType_id', 'glofaType__num', 'glofaType__description'))
    return JsonResponse({'data': data})