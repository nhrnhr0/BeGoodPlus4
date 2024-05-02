from .base import *

COMPRESS_ENABLED = False
DEBUG=False

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'https://test2.ms-global.co.il'
]
CSRF_TRUSTED_ORIGINS = [
    'https://test2.ms-global.co.il'
]
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = 'lax'
SESSION_COOKIE_SAMESITE = 'lax'

CORS_ORIGIN_WHITELIST= [
    'https://catalog.ms-global.co.il',
]