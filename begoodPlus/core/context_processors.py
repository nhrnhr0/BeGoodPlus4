

from .forms import FormBeseContactInformation
def loadBaseInfo(request):
    #request.set_cookie('device', 'my-id')
    
    
    contactForm = FormBeseContactInformation()
    context  = {'contactForm': contactForm}
    return context