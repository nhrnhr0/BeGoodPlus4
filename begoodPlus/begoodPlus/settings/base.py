"""
Django settings for begoodPlus project.

Generated by 'django-admin startproject' using Django 3.0.8.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os

from rest_framework.fields import DateTimeField
from .. import secrects
import cloudinary
import cloudinary.uploader
import cloudinary.api

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))




# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
#SECRET_KEY = '#r*r40h()nfz(8duh2%98n2=2y$!7hd6law4t#_mkht3xafe(c'
SECRET_KEY = secrects.SECRET_KEY
#SECRET_KEY = '123456frtt5'
# SECURITY WARNING: don't run with debug turned on in production!

ALLOWED_HOSTS = ['*']

MY_DOMAIN = 'https://ms-global.co.il' #'http://127.0.0.1:8000'
'''
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "sample_task": {
        "task": "core.tasks.update_catalogAlbum_timers",
        "schedule": crontab(minute="*/1"),
    },
}
'''
# Application definition
APPEND_SLASH = True
INSTALLED_APPS = [


    # 3rd party
    'django_crontab',
    'colorfield',
    'rest_framework',
    'rest_framework.authtoken',
    'django_user_agents',
    'django_extensions',
    'django_admin_index',
    'ordered_model',
    'admin_adv_search_builder',
    'mptt',
    'django_mptt_admin',
    'adminsortable',
    'admin_numeric_filter',
    #'jet',
    'dbbackup',
    'webpush',
    'tof',
    'bootstrap5',
    'drf_multiple_model',
    'compressor',
    'advanced_filters',
    #'rest_framework_simplejwt',
    'corsheaders',
    'cloudinary',
    'celery',
    'django_celery_beat',

    # own
    'core',
    'color',
    'provider',
    'productColor',
    'productSize',
    'packingType',
    
    'catalogImages',
    'catalogAlbum',
    'catalogLogos',
    
    'customerCart',
    'catalogImageDetail',
    'clientApi',
    'client',


    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    #'debug_toolbar', # TODO: remove in production
]

CELERY_IMPORTS = [
    'core.tasks',
]


CELERY_BEAT_SCHEDULE = {
    "scheduled_task": {
        "task": "core.tasks.close_inactive_user_sessions",
        "schedule": 5.0,
    }
}



# django-dbbackup
DBBACKUP_STORAGE = 'django.core.files.storage.FileSystemStorage'
DBBACKUP_STORAGE_OPTIONS = {'location': BASE_DIR  + '/backups/'}
DATA_UPLOAD_MAX_NUMBER_FIELDS = 10240 # higher than the count of fields

#cron
CRONJOBS = [
    ('59 23 * * *', 'begoodPlus.cron.my_db_backup')
]

# django_user_agents implementation
# Cache backend is optional, but recommended to speed up user agent parsing
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}
# Name of cache backend to cache user agents. If it not specified default
# cache alias will be used. Set to `None` to disable caching.
USER_AGENTS_CACHE = 'default'

#django-compressor
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',

    # Add this
    'compressor.finders.CompressorFinder',
)

MIDDLEWARE = [
    #'debug_toolbar.middleware.DebugToolbarMiddleware', # TODO: remove in production
    #django-compressor
    'django.middleware.gzip.GZipMiddleware',
    'htmlmin.middleware.HtmlMinifyMiddleware',
    'htmlmin.middleware.MarkRequestMiddleware',
    
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # own
    #'django.middleware.locale.LocaleMiddleware',
    'django_user_agents.middleware.UserAgentMiddleware',
    'core.middleware.BaseMiddleware',
]

# Compressor and minifier config
'''
COMPRESS_CSS_HASHING_METHOD = 'content'
COMPRESS_FILTERS = {
    'css':[
        'compressor.filters.css_default.CssAbsoluteFilter',
        'compressor.filters.cssmin.rCSSMinFilter',
    ],
    'js':[
        'compressor.filters.jsmin.JSMinFilter',
    ]
}
HTML_MINIFY = False # is True, create problems with markdown in catalog2.html page
KEEP_COMMENTS_ON_MINIFYING = False

INTERNAL_IPS = [
    '127.0.0.1',
]
'''

ROOT_URLCONF = 'begoodPlus.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'static_cdn','templates'),
                os.path.join(BASE_DIR, 'static_cdn', 'svelte', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                #'django.core.context_processors.request', #my code
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                
                # own
                'pages.context_processors.navbar_load',
                'core.context_processors.loadBaseInfo',
            ],
        },
    },
]

WSGI_APPLICATION = 'begoodPlus.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        'OPTIONS': {
            'timeout': 20, 
        }
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

#LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'he'

#TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

# use timezone

TIME_ZONE = 'Israel'
USE_TZ = True 


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/



LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale')
]


STATIC_ROOT= os.path.join(BASE_DIR, "static") # when changed, change allso templates location
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static_cdn"),
]

MEDIA_URL= '/media/'
MEDIA_ROOT = os.path.join(STATIC_ROOT, 'media_root/')

cloudinary.config( 
  cloud_name = secrects.CLOUDINARY_NAME,
  api_key = secrects.CLOUDINARY_KEY,
  api_secret = secrects.CLOUDINARY_SECRECT,
  secure = True
)


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
#EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'email-smtp.us-east-2.amazonaws.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_HOST_USER = secrects.EMAIL_HOST_USER
EMAIL_HOST_PASSWORD =  secrects.EMAIL_HOST_PASSWORD
# from django.core.mail import send_mail
# send_mail(subject='hey', message='message', from_email='bot@ms-global.co.il', recipient_list=['nhrnhr0@gmail.com'])
import datetime

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=1),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=1),
    'UPDATE_LAST_LOGIN': True,
}
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    )
}

WEBPUSH_SETTINGS = {
    "VAPID_PUBLIC_KEY": secrects.VAPID_PUBLIC_KEY,
    "VAPID_PRIVATE_KEY":secrects.VAPID_PRIVATE_KEY,
    "VAPID_ADMIN_EMAIL": "computer-support@ms-global.co.il"
}



BROKER_USER = secrects.BROKER_USER
BROKER_PASSWOD = secrects.BROKER_PASSWORD
