"""
https://docs.celeryproject.org/en/stable/index.html
https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html#using-celery-with-django
"""
import os

from celery import Celery, Task

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transformer.settings")
app = Celery("transformer")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self: Task) -> None:
    print(f"Hello world!")  # noqa
    return
