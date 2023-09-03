from typing import Any, TypeVar, TypedDict

from django.db.models import Model, QuerySet
from django.db.models.fields.files import FieldFile
from django.forms import model_to_dict

T = TypeVar("T", bound=Model)
FieldsType = list[str] | None


class ModelFieldType(TypedDict):
    url: str
    size: int


def serialize_queryset(
    *, queryset: QuerySet[T], fields: FieldsType = None
) -> list[dict[str, Any]]:
    """
    Serializes a Django QuerySet into a list of dictionaries with optional fields.

    :param queryset: Django QuerySet to be serialized.
    :param fields: Optional list of field names to include in the serialized output.
                   If not provided, all fields will be included.
    :raises ValueError: If any field in the 'fields' list does not exist in the model.
    :return: List of dictionaries representing the serialized QuerySet.

    Note:
    - Relations to other tables in the database are not handled.
    - FieldFile type fields are not handled.
    """

    if fields:
        # TODO relations to other table in database not handled.
        # TODO FieldFile
        model_fields = [f.name for f in queryset.model._meta.fields]
        annotation_fields = queryset.query.annotations.keys()
        known_fields = set(model_fields + list(annotation_fields))
        unknown_fields = [field for field in fields if field not in known_fields]
        if unknown_fields:
            raise ValueError(f"Unknown fields: {', '.join(unknown_fields)}")

        return list(queryset.only(*fields).values(*fields))
    return list(queryset.values())


def serialize_instance_list(
    *, instance_list: list[T], fields: FieldsType = None
) -> list[dict[str, Any]]:
    """
    Serializes a list of Django model instances into a list of dictionaries with optional fields.

    :param instance_list: List of Django model instances to be serialized.
    :param fields: Optional list of field names to include in the serialized output.
                   If not provided, all fields will be included.
    :return: List of dictionaries representing the serialized instances.
    """

    return list(
        map(
            lambda instance: serialize_instance(instance=instance, fields=fields),
            instance_list,
        )
    )


def serialize_instance(*, instance: T, fields: FieldsType = None) -> dict[str, Any]:
    """
    Serializes a single Django model instance into a dictionary with optional fields.

    :param instance: Django model instance to be serialized.
    :param fields: Optional list of field names to include in the serialized output.
                   If not provided, all fields will be included.
    :return: Dictionary representing the serialized instance.

    Note:
    - If a field is of type FieldFile, the output will include the URL and size of the file.
    """

    if fields:
        serialized = {field: getattr(instance, field) for field in fields}
    else:
        serialized = model_to_dict(instance)

    for field, value in serialized.items():
        if isinstance(value, FieldFile):
            serialized[field] = ModelFieldType(url=value.url, size=value.size)

    return serialized
