from typing import Any, TypeVar, TypedDict, get_type_hints

from django.db.models import Model, QuerySet
from django.db.models.fields.files import FieldFile
from django.forms import model_to_dict

from transformer.exceptions import SerializationError

T = TypeVar("T", bound=Model)
FieldsType = list[str] | None


class FileFieldType(TypedDict):
    url: str
    size: int


# django serializer https://docs.djangoproject.com/en/3.2/topics/serialization/
# is not enough to serialize queryset in needed way. Decided to write custom queryset serializer
def serialize_queryset(
    queryset: QuerySet[T],
    fields: list[str],
    select_related_model_mapping: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """
    Serializes a Django QuerySet into a list of dictionaries with optional fields.

    :param queryset: Django QuerySet to be serialized. (may include annotations / left join on table)
    :param select_related_model_mapping: Dictionary of TypedDicts for related models.
                                  Keys should be the 'related_name' of the related models.
    :param fields: List of field names to include in the serialized output.

                   Serialize annotation fields can be provided directly

                   Example:
                   :queryset MyModel.objects.annotate(example=...)
                   :fields fields=["example", ...],

                   serialize_queryset(..., fields=["example", ...], ...)

                   ______________________________________________________________________________________________

                   Serialize fields from select_related must include select_related value in :fields
                   TypedDict (type[U]) must include exact fields as in related model

                   Example:

                   Models:
                       class MyModel:
                            ...

                       class SRModel:
                            csv_file = models.OneToOneField(
                                "MyModel",
                                on_delete=models.CASCADE,
                                related_name="related_connection_name",  <--- important!
                            )
                            foo = models.TextField(...)
                            ...

                   TypedDict
                       class SRModelType(TypedDict):
                            foo: str
                            ...

                   :queryset MyModel.objects.select_related("related_connection_name")


                    serialize_queryset(...,
                        fields=["related_connection_name", ...],
                        related_models={
                            'related_connection_name': SRModelType
                        }
                    )

    :raises AttributeError: If any field in the 'fields' list does not exist in the model or instance.
    :return: List of dictionaries representing the serialized QuerySet.

    Note:
    - This implementation does not handle nested relations ie. `Author -> Book -> Publisher` or prefetch_related
    """

    serialized_data = []
    annotation_fields = queryset.query.annotations.keys()
    select_related_model_keys = (
        select_related_model_mapping.keys() if select_related_model_mapping else []
    )

    for obj in queryset:
        serialized_obj: dict[str, Any] = {}
        for field in fields:
            object_field = getattr(obj, field, None)
            if isinstance(object_field, FieldFile):
                try:
                    serialized_obj[field] = FileFieldType(
                        url=object_field.url, size=object_field.size
                    )
                except ValueError:
                    # that means user selected file to enrich, made a request with external_url but didnt select columns to merge.
                    # this instance will be deleted with user (frontend show that this instance is not valid or removed with celery schedule task - clear_empty_csvfile)
                    serialized_obj[field] = None
                except FileNotFoundError:
                    # that mean someone has deleted related file
                    serialized_obj[field] = "Not found"
            elif field in annotation_fields:
                serialized_obj[field] = object_field
            elif field in select_related_model_keys:
                if object_field:
                    related_typeddict = select_related_model_mapping[field]  # type: ignore  # error: Value of type "Optional[Dict[str, Any]]" is not indexable - mypy incorrectly mark that because if we loop over select_related_model_keys, that means select_related_model_mapping exists and it is indexable
                    typeddict_fields = list(get_type_hints(related_typeddict).keys())
                    try:
                        serialized_obj[field] = serialize_instance(
                            instance=object_field, fields=typeddict_fields
                        )
                    except AttributeError:
                        raise SerializationError(obj, field)
                else:
                    serialized_obj[field] = object_field
            else:
                serialized_obj[field] = object_field

        serialized_data.append(serialized_obj)

    return serialized_data


# TODO to remove
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


# `django.core.serializers` is not so good, ie it has problem to serialize primary_keys.
#  Also, FileField is serialized by django in not expected way.
def serialize_instance(*, instance: T, fields: FieldsType = None) -> dict[str, Any]:
    """
    Serializes a single Django model instance into a dictionary with optional fields.

    :param instance: Django model instance to be serialized.
    :param fields: Optional list of field names to include in the serialized output.
                   If not provided, all fields will be included.
    :return: Dictionary representing the serialized instance.

    :raises SerializationError: If any field in the 'fields' list does not exist in the instance.

    Note:
    - If a field is of type FieldFile, the output will include the URL and size of the file.
    """

    if fields:
        serialized = {}
        for field in fields:
            try:
                serialized.update({field: getattr(instance, field)})
            except AttributeError:
                raise SerializationError(instance, field)
    else:
        serialized = model_to_dict(instance)

    for field, value in serialized.items():
        if isinstance(value, FieldFile):
            serialized[field] = FileFieldType(url=value.url, size=value.size)

    return serialized
