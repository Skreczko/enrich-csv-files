from django.db.models import Model


class SerializationError(Exception):
    def __init__(self, instance: Model, field: str) -> None:
        self.instance = instance
        self.field = field
