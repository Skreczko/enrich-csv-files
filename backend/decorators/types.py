from collections.abc import Callable
from typing import Any

from django.http import HttpRequest, HttpResponse

GenericFunc = Callable[[HttpRequest, Any, Any], HttpResponse]
WrapperFunc = Callable[[HttpRequest, Any, Any], HttpResponse]
