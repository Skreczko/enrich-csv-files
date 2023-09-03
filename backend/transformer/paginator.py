from django.core.paginator import EmptyPage, InvalidPage, Paginator
from django.db.models import Model, QuerySet
from typing import TypeVar, TypedDict


class PaginatorDetailsType(TypedDict):
    total_pages: int
    page_number: int
    page_size: int


T = TypeVar("T", bound=Model)


class CustomPaginator:
    """
    Class responsible for paginating a queryset.
    """

    page_size = 20
    max_page_size = 50

    def __init__(
        self,
        queryset: QuerySet[T],
        page_number: int = 1,
        page_size: int | None = None,
    ) -> None:
        self.page_number = page_number
        self.queryset = queryset
        self.page_size = page_size or CustomPaginator.page_size
        self.paginator = Paginator(self.queryset, self.page_size)

    def get_paginator_details(self) -> PaginatorDetailsType:
        """
        Return details about the pagination.
        """

        return PaginatorDetailsType(
            total_pages=self.paginator.num_pages,
            page_number=self.page_number,
            page_size=self.page_size,
        )

    def paginate_queryset(self, page_number: int) -> list[T]:
        """
        Paginate the queryset and return a list of model instances for the given page number.
        An error will be raised for an empty page or an invalid page number.
        """
        page = self.paginator.page(page_number or self.page_number)
        try:
            return list(
                page.object_list
            )  # that is list of Model Instances, but mypy treat it like QuerySet, so that is why it is wrapped in "list"
        except (EmptyPage, InvalidPage):
            raise InvalidPage("Invalid page number")
