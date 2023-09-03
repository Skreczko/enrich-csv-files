from typing import Any, TypeVar, TypedDict

from django.db.models import Model, QuerySet
from django.forms import model_to_dict

T = TypeVar("T", bound=QuerySet)
U = TypeVar("U", bound=Model)

class SerializeQuerysetType(TypedDict):
    data: list[str, Any]


def serialize_queryset(*, queryset: type[T], fields: list[str] | None = None) -> SerializeQuerysetType:
    """
    function used to serialize queryset with/without list of fields to serialize

    If field value does not exist in model, ValueError will be raised
    """
    if fields:
        model_fields = [f.name for f in queryset.model._meta.fields]
        unknown_fields = [field for field in fields if field not in model_fields]
        if unknown_fields:
            raise ValueError(f"Unknown fields: {', '.join(unknown_fields)}")
        query_list = queryset.values(*fields)
    else:
        query_list = queryset.values()
    return {"data": list(query_list) }


def serialize_instance(instance: type[U], fields: list[str] | None = None) -> dict[str, Any]:
    if fields:
        return {field: getattr(instance, field) for field in fields}
    return model_to_dict(instance)
