import json
from typing import Any

from django import forms
from django.core.exceptions import ValidationError


class CharListField(forms.CharField):
    def to_python(self, value: str | None) -> list[str] | None:
        if not isinstance(value, str):
            raise ValidationError("Value is not string")
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            raise ValueError("The provided string is not a valid JSON format")

    def prepare_value(self, value: list[Any]) -> Any:
        return json.dumps(value)
