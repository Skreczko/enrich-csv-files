from celery.app.control import Control
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from requests import Request

from transformer.url_patterns import lazy_function_view


def healthcheck(request: Request) -> HttpResponse:
    from django.db import connection
    from .celery import app
    import json

    status = {}
    try:
        tables = connection.introspection.table_names()
        status["DB"] = f"ok, tables: {', '.join(tables)}"
    except Exception as e:
        status["DB"] = f"error, {e}"

    try:
        control = Control(app)
        celery_status = control.broadcast("ping", reply=True, limit=1)
        tasks = list(control.inspect().registered_tasks().values())[0]  # type: ignore
        status["CELERY"] = (
            f"ok, tasks: {', '.join(tasks)}" if celery_status else "error"
        )
    except Exception as e:
        status["CELERY"] = f"error, {e}"

    return HttpResponse(json.dumps(status), content_type="application/json")


urlpatterns = [
    path("healthcheck.json", healthcheck),
    re_path(
        # for every endpoint - user validation should be provided by using token which should be appended for every request using axios
        # in this case, using django and put react to django template we can
        # 1. create additional endpoint to obtain token
        # 2. provide token in django template, ie we have `<div id="root" data-token="{{ api_token}}"></div>` in tem
        #   where api_token should be attached ie. to context_processor in middleware
        #   on frontend side (in index.js), we should fetch that token, dispatch it to redux state and then create wrapper
        #   for axios to provide that token in every request in header
        r"^api/_internal",
        include(
            [
                path(
                    "/csv_upload",
                    lazy_function_view(
                        "csv_manager.views.api_internal.csv_upload.csv_upload"
                    ),
                    name="csv_upload",
                ),
                path(
                    "/enrich_file_create",
                    lazy_function_view(
                        "csv_manager.views.api_internal.csv_enrich_file_create.csv_enrich_file_create"
                    ),
                    name="csv_enrich_file_create",
                ),
                path(
                    "/fetch_task_results",
                    lazy_function_view(
                        "csv_manager.views.api_internal.fetch_task_results.fetch_task_results"
                    ),
                    name="fetch_task_results",
                ),
                re_path(
                    r"^/csv_list",
                    include(
                        [
                            path(
                                "",
                                lazy_function_view(
                                    "csv_manager.views.api_internal.csv_list.csv_list"
                                ),
                                name="csv_list",
                            ),
                            path(
                                "/<uuid:uuid>/read_detail_chunk",
                                lazy_function_view(
                                    "csv_manager.views.api_internal.csv_detail_chunks_get.csv_detail_chunks_get"
                                ),
                                name="csv_detail_chunks_get",
                            ),
                            path(
                                "/<uuid:uuid>/enrich_detail_create",
                                lazy_function_view(
                                    "csv_manager.views.api_internal.csv_enrich_detail_create.csv_enrich_detail_create"
                                ),
                                name="csv_enrich_detail_create",
                            ),
                        ],
                    ),
                ),
            ],
        ),
    ),
    # redirect rest paths to React Router, as path above MUST be handled by django
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]

# TODO debug_toolbar

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
