from .base import *

COMPRESS_ENABLED = False
DEBUG=False

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'https://nhrnhr0.github.io',
    'https://test2.ms-global.co.il'
]
CSRF_TRUSTED_ORIGINS = [
    'https://nhrnhr0.github.io',
    'https://test2.ms-global.co.il'
]

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = 'lax'
SESSION_COOKIE_SAMESITE = 'lax'

'''
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
]

CSRF_TRUSTED_ORIGINS = [
    'localhost:3000',
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'lax'
SESSION_COOKIE_SAMESITE = 'None'
'''