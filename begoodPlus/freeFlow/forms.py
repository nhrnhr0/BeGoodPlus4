

from django.forms import ModelForm
from .models import FreeFlowClient
class freeFlowClientForm(ModelForm):
    class Meta:
        model = FreeFlowClient
        fields = ['name','email', 'phone', 'country', 'message','privatePerson']