from begoodPlus.secrects import SECRECT_BASE_MY_DOMAIN
from .base import *
#from begoodPlus.urls import urlpatterns

from django.urls import path, include, re_path

DEBUG = True
COMPRESS_ENABLED = False
INSTALLED_APPS.append('debug_toolbar')
# INSTALLED_APPS.insert(0,'livereload')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # 'silk.middleware.SilkyMiddleware',
    # 'livereload.middleware.LiveReloadScript',
]

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True,
}
print('===========> development settings')
INTERNAL_IPS = [
    '*',
]

def show_toolbar(request):
    return True
SHOW_TOOLBAR_CALLBACK = show_toolbar
DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK" : show_toolbar,
}

# INSTALLED_APPS += [
#     'silk',
# ]

# LOGGING = {
#     'version': 1,
#     'filters': {
#         'require_debug_true': {
#             '()': 'django.utils.log.RequireDebugTrue',
#         }
#     },
#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'filters': ['require_debug_true'],
#             'class': 'logging.StreamHandler',
#         }
#     },
#     'loggers': {
#         'django.db.backends': {
#             'level': 'DEBUG',
#             'handlers': ['console'],
#         }
#     }
# }
