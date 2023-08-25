"""
Django settings for transformer project.

Generated by 'django-admin startproject' using Django 3.2.6.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-8ew7hf41c8b__6r(p1*md@a-m=2%sq^)^an=awx7zr9saf4%)h'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*'] + [os.environ.get("ALLOWED_HOSTS", "")]


# Application definition
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
]
INSTALLED_APPS += ["webpack_loader"]

ROOT_URLCONF = 'transformer.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(FRONTEND_DIR, "templates")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'transformer.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases
DATABASE_NAME = os.environ.get("DATABASE_NAME", "transformer")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": os.environ.get("POSTGRES_HOST", "postgres"),
        "NAME": os.environ.get("POSTGRES_DB", "transformer"),
        "USER": os.environ.get("POSTGRES_USER", "postgres"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        "TEST": {
            "NAME": f"{DATABASE_NAME}_test",
        },
    }
}

# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/
USE_TZ = True
TIME_ZONE = 'UTC'

LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_L10N = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/
STATIC_URL = "frontend/static/"
LOCAL_STATICFILES_DIR = os.path.join(FRONTEND_DIR, "static")

STATIC_ROOT = os.path.join(DATA_DIR, "static")

STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "static/bundles"),
    # only for local purposes
    LOCAL_STATICFILES_DIR,
]

# MEDIA FILES
MEDIA_URL = "frontend/media/"
MEDIA_ROOT = os.path.join(FRONTEND_DIR, "media")

# WEBPACK
WEBPACK_LOADER_TEST_DISABLED = True
WEBPACK_LOADER = {
    "DEFAULT": {
        "USE_DEV_SERVER": False,
        "CACHE": not DEBUG,
        "BUNDLE_DIR_NAME": "./",
        "STATS_FILE": os.path.join(FRONTEND_DIR, "webpack-stats.json"),
    }
}


# Celery
BROKER_URL = os.environ['BROKER_URL']
CELERY_BROKER_URL = f'{BROKER_URL}/0'
CELERY_RESULT_BACKEND = f'{BROKER_URL}/1'
CELERY_WORKER_CONCURRENCY = 1
