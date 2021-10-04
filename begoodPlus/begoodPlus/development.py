from .base import *


DEBUG=True
COMPRESS_ENABLED = False
INSTALLED_APPS.insert(0,'debug_toolbar')
#INSTALLED_APPS.insert(0,'livereload')
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://127.0.0.1:5502",
    "http://127.0.0.1:5503",
    "http://localhost:8087",
    'http://*'
]
CORS_ALLOW_ALL_ORIGINS=True

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    #'livereload.middleware.LiveReloadScript',
]