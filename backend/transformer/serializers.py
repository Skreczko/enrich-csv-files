from typing import Any, TypeVar, TypedDict

from django.db.models import Model, QuerySet
from django.forms import model_to_dict

T = TypeVar("T", bound=QuerySet)
U = TypeVar("U", bound=Model)

class SerializeQuerysetType(TypedDict):
    data: list[str, Any]


def serialize_queryset(*, queryset: type[T], fields: list[str] | None = None) -> SerializeQuerysetType:
    if fields:
        query_list = queryset.values(*fields)
    else:
        query_list = queryset.values()
    return {"data": list(query_list) }


def serialize_instance(instance: type[U], fields: list[str] | None = None) -> dict[str, Any]:
    if fields:
        return {field: getattr(instance, field) for field in fields}
    return model_to_dict(instance)
