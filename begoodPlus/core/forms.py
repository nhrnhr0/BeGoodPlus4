


from django import forms

from .models import BeseContactInformation

class BaseForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(BaseForm, self).__init__(*args, **kwargs)
        #for bound_field in self:
        #    if hasattr(bound_field, "field") and bound_field.field.required:
        #        bound_field.field.widget.attrs["required"] = "required"

class FormBeseContactInformation(BaseForm):
    name = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'שם - חובה'}), label='', )
    email = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'אימייל'}), label='',)
    phone = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'פאלפון - חובה'}), label='',)
    message = forms.CharField(widget=forms.Textarea(attrs={'placeholder': 'הודעה', 'rows':'2'}), label='', )
    url = forms.URLField(widget=forms.HiddenInput())
    formUUID = forms.URLField(widget=forms.HiddenInput())
    sumbited = forms.BooleanField(widget=forms.HiddenInput(), initial=False)
    def __init__(self, *args, **kwargs):
        super(FormBeseContactInformation, self).__init__(*args, **kwargs)
        self.fields['message'].required = False
        self.fields['email'].required = False
        self.fields['url'].required = False
        self.fields['formUUID'].required = False
    class Meta:
        model = BeseContactInformation
        fields = '__all__'