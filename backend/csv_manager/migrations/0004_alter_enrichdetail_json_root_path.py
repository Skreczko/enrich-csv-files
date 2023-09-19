# Generated by Django 3.2.6 on 2023-09-18 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('csv_manager', '0003_alter_enrichdetail_json_root_path'),
    ]

    operations = [
        migrations.AlterField(
            model_name='enrichdetail',
            name='json_root_path',
            field=models.TextField(default='', help_text="Path pointing to the root element in the JSON structure from which data should be extracted. Use this path if the data you want to process isn't directly at the top level of the JSON."),
        ),
    ]
