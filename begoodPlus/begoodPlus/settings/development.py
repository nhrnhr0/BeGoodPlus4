from begoodPlus.secrects import SECRECT_BASE_MY_DOMAIN
from .base import *


DEBUG=True
COMPRESS_ENABLED = False
INSTALLED_APPS.append('debug_toolbar')
#INSTALLED_APPS.insert(0,'livereload')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    #'livereload.middleware.LiveReloadScript',
]

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True,
}

INTERNAL_IPS = [
    '127.0.0.1',
]

MY_DOMAIN = SECRECT_BASE_MY_DOMAIN