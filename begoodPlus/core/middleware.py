

from django.utils.deprecation import MiddlewareMixin

import uuid
import json
from django.http import HttpResponse

class DisableCSRF(MiddlewareMixin):
    def process_request(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)


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
            #uniqe_str = str(uuid.uuid1())

            device = ip  # + '_'+ uniqe_str
            request.COOKIES['device'] = device

        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.

        if response.cookies.get('device') == None:
            response.set_cookie('device', device, max_age=30)

        return response





# https://gist.github.com/fabiosussetto/c534d84cbbf7ab60b025
class NonHtmlDebugToolbarMiddleware(object):
    """
    The Django Debug Toolbar usually only works for views that return HTML.
    This middleware wraps any JSON response in HTML if the request
    has a 'debug' query parameter (e.g. http://localhost/foo?debug)

    adapted from:
    https://gist.github.com/fabiosussetto/c534d84cbbf7ab60b025
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.GET.get('debug', None) is not None:
            if response['Content-Type'] == 'application/json':
                content = json.dumps(json.loads(response.content), indent=4)
                response = HttpResponse(u'<html><body><pre>{}</pre></body></html>'.format(content))

        return response