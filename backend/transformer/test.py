from typing import Any
from collections.abc import Iterator

from django.core.cache.backends.dummy import DummyCache


class IgnoreAllMigrations(dict):
    def __getitem__(self, key):
        return None

    def __contains__(self, key):
        return True


class EmptyCache(DummyCache):
    def delete_pattern(self, pattern: str) -> None:
        pass

    def iter_keys(self, pattern: str) -> Iterator[Any]:
        return []


SENTRY_DSN = None
CELERY_CACHE_BACKEND = "memory"
CELERY_RESULT_BACKEND = "cache"
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_REMOTE_TRACEBACKS = True
CELERY_TASK_EAGER_PROPAGATES = True
DEBUG = False

from .settings import *  # noqa

CACHES = {
    "default": {"BACKEND": "transformer.test.EmptyCache"},
}
MIGRATION_MODULES = IgnoreAllMigrations()
TEMPLATE_DEBUG = False
TEST = True

DEBUG_DYNAMIC_CODE = False
PRIVATE_BUCKET_NAME = None
WEBPACK_LOADER["DEFAULT"]["STATS_FILE"] = os.environ.get(
    "WEBPACK_LOADER_STATS_FILE",
    os.path.join(BASE_DIR, "backend/csv_manager/tests/test-webpack-stats.json"),
)
