# Generated by Django 3.2.6 on 2023-09-07 22:08

import csv_manager.enums
import csv_manager.models
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CSVFile',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('file', models.FileField(blank=True, null=True, upload_to=csv_manager.models.csv_upload_path)),
                ('original_file_name', models.TextField()),
                ('file_row_count', models.IntegerField(blank=True, help_text='Number of table rows excluding table header', null=True)),
                ('file_headers', models.JSONField(blank=True, help_text='List of headers from file. Use this field instead using file to get headers', null=True)),
                ('source_instance', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='enriched_instances', to='csv_manager.csvfile')),
            ],
            options={
                'ordering': ['created'],
            },
        ),
        migrations.CreateModel(
            name='EnrichDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[(csv_manager.enums.EnrichmentStatus['IN_PROGRESS'], 'in_progress'), (csv_manager.enums.EnrichmentStatus['FINISHED'], 'finished'), (csv_manager.enums.EnrichmentStatus['FAILED'], 'failed'), (csv_manager.enums.EnrichmentStatus['INITIATED'], 'initiated')], default=csv_manager.enums.EnrichmentStatus['INITIATED'], help_text='Status of process of enrichment csv file', max_length=50)),
                ('external_url', models.URLField(help_text='The origin URL which was used to enrich')),
                ('external_response', models.JSONField()),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('external_elements_count', models.IntegerField(blank=True, help_text='Number of dict elements', null=True)),
                ('join_type', models.CharField(blank=True, choices=[(csv_manager.enums.EnrichmentJoinType['LEFT'], 'left'), (csv_manager.enums.EnrichmentJoinType['RIGHT'], 'right'), (csv_manager.enums.EnrichmentJoinType['INNER'], 'inner')], help_text='Selected type of join', max_length=50, null=True)),
                ('is_flat', models.BooleanField(default=False, help_text='Indicates whether the dict should be flattened when stored in the table cell.')),
                ('external_elements_key_list', models.JSONField(blank=True, help_text='List of main keys from external_response. Use this field instead using external_response to get keys', null=True)),
                ('selected_key', models.TextField(help_text="Selected json key from 'external_elements_key_list' to be used to merge with 'CSVFile.file_headers'")),
                ('selected_header', models.TextField(help_text="Selected header from 'CSVFile.file_headers' to be used to merge with 'external_elements_key_list'")),
                ('csv_file', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='enrich_detail', to='csv_manager.csvfile')),
            ],
        ),
    ]
