import pytest
from django.core.paginator import EmptyPage

from csv_manager.models import CSVFile
from transformer.paginator import CustomPaginator


def test_custom_paginator_correct_page_number(
    multiple_enriched_csv_files: None,
):
    paginator = CustomPaginator(queryset=CSVFile.objects.all(), page_size=20)
    queryset = paginator.paginate_queryset(1)

    assert queryset.count() == 20


def test_custom_paginator_incorrect_page_number(
    multiple_enriched_csv_files: None,
):
    paginator = CustomPaginator(queryset=CSVFile.objects.all(), page_size=20)
    with pytest.raises(EmptyPage, match="That page contains no results"):
        paginator.paginate_queryset(9999)
