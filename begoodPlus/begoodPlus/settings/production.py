from begoodPlus.secrects import SECRECT_BASE_MY_DOMAIN
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

MY_DOMAIN =  SECRECT_BASE_MY_DOMAIN # '127.0.0.1:8000'
CSRF_COOKIE_DOMAIN = '.' +  MY_DOMAIN