"""
https://docs.celeryproject.org/en/stable/index.html
https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html#using-celery-with-django
"""
import os

from celery import Celery, Task
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transformer.settings")
app = Celery("transformer")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self: Task) -> None:
    print(f"Hello world!")  # noqa
    return


app.conf.beat_schedule = {
    "clear-csvfile": {
        "task": "csv_manager.tasks.clear_empty_csvfile",
        "schedule": crontab(minute="0", hour="3", day_of_month="*/3"),
    },
}
