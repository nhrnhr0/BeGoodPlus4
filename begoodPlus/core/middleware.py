


import uuid
class BaseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.
        
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if 'device' in request.COOKIES:
            device = request.COOKIES['device']
        else:
            ip = self.get_client_ip(request)
            uniqe_str = str(uuid.uuid1())
            
            device = ip + '_'+ uniqe_str
            request.COOKIES['device']=device

        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.

        if response.cookies.get('device') == None:
            response.set_cookie('device', device)



        return response
        