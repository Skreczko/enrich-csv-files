### store files
Files should be stored in external services, ie S3.

### celery
adding priority to celery. Create function to assign priority by file size.

### monitoring
Datadog could be applied / or logs.

## urls.py
Decided to change path to re_path, as I wanted to keep original project structure provided by Jakub.
That allowed me to pass URL paths directly to React Router. 

Optimization as lazy_import for urls paths by custom function (lazy_function_view)

## docker-compose.yml
Decided to include to django container only necessary folders or files from "frontend". For this case, 
everything is bundled and included in "bundles" folder except files/folders which I took into account. Added warning comment. If needed, we remove that and include
whole "frontend" folder.

## List of uploaded csv section

### Frontend
* On the first run - request for information which files are in celery queue marked as (in progress) - after enrich.

* If related state in redux is filled, request for that file's status each XX seconds. 
Remove that file details from redux after getting info other than "in_progress"

* Notifications will emerge when enriched file status has been changed.

### Backend
* Custom serializer functions (as DRF is restricted to use). `django.core.serializers` is not so good, ie it has problem to serialize primary_keys. Also, FileField is serialized in not expected way.
In my custom serializer, not every case is handled.
* Custom paginator (from django) also adapted to met conditions from project.

## Upload file section

### Backend
* used `TemporaryFileUploadHandler` and set `FILE_UPLOAD_MAX_MEMORY_SIZE=0`. For future development - addapt endpoint with frontend to send chunks.

### Frontend
* During upload process, pushing file details to redux. That allows us to unnessesary request for list of files during
* User cannot duplicate files in same uploading process - that means, if user upload file, same file can be added in next turn.
* OPTIMIZATION -> as axios stream data, decided to stay with that. for future development - using package (ie resumable.js or plupload) to send file in chunk
* Applied throttle as optimization for updating redux state. Stayed with default axios behavior
* Additional logic required for situation, where some files failed in uploading process and some passed correctly. Button "upload" stays disabled - but should allow to reupload failed files.
* Provided throttle for 1s for updating progress bar - not to overheat redux


### Future development
* as in requirements - django and react must be used - decided to use webpack for easy support to provide static files (with webpack-stats.json). For future development I would use DRF and SPA with Vite bundler to create totally different envs for frontend and backend.
* for every endpoint - user validation should be provided by using token which should be appended for every request using axios
in this case, using django and put react to django template we can
1. create additional endpoint to obtain token
2. provide token in django template, ie we have `<div id="root" data-token="{{ api_token}}"></div>` in tem
    where api_token should be attached ie. to context_processor in middleware
    on frontend side (in index.js), we should fetch that token, dispatch it to redux state and then create wrapper 
    for axios to provide that token in every request in header

* user check on selected endpoint with custom with decorator / adding that in middleware
* creating websocket to push notifications to redux / creating endpoint which gives information which celery task is still in queue - obtain task_id and push that to redux. request every 10second to endpoint with these task_id and check if its already completed. return info to redux about status and displaying correct notification (success/failed)
* modifying endpoint to create possibility to obtain chunks, and then merging them with petl. it may solve problems with internet disconnection,optimalization
* As we can enrich files - we can add additional csv list view as "tree", where user can select that and see "root" file, and expand to see which files were created using that root file, ie https://primereact.org/treetable/ 


### Optimization

## Backend
* Added `TemporaryFileUploadHandler` with `FILE_UPLOAD_MAX_MEMORY_SIZE = 0` for making chunks during uploading files.
* Added `ijson` for count api response objects and set up header
* Added `yajl2` parser for increase parsing (https://lpetr.org/2016/05/30/faster-json-parsing-python-ijson/)
  and https://stackoverflow.com/a/17326199 where 
```
(...)Comparing execution time with other solutions, ijson is rather slow (57 s versus stdlib json), but it is excellent if you need to keep memory consumption low (13 MB versus stdlib json 439 MB). Using with yajl2 backend, it was not faster, but memory consumption dropped down to 5 MB. Tested on 3 files each being about 30 MB large and having 300 thousands records."
```
* Used `GZipMiddleware` for compressing responses https://docs.djangoproject.com/en/3.2/_modules/django/middleware/gzip/#GZipMiddleware
* Added info about csv / api response count and headers / key to database - as this data will not change and we can avoid opening files
* Used petl for merge process
* As DRF is restricted (as Jakub said) created custom serializers `serializer.py`
* For csv preview - used `etl.rowslice` for pagination
* For csv preview  - custom cache view - `cache_view_response` for JSON response (as DRF is restricted, redirected all request which does not fit to urls.py to react to handle it there)
* For status updates, used `queryset.update()` instead `.save()` to make that change directly in database
* Added `flatdict` to flat json file on user request during enchrichment process
* Using generators in many places
* Added DDT https://pypi.org/project/django-debug-toolbar/ to track query. Ajax query can be viewed in "history" tab.
* Added `Sentry` (https://adverity-transformer-197cd18c7.sentry.io/issues/ - credentials in `.env.example`

# TODO
* `Sentry` has default setup. May be required to add additional sentry envs for local/test/prod
* Handle the deletion of files. Currently, we only delete records from the database, but the files remain. Depending on business requirements, we may want to retain them for a certain period or delete them immediately. If we choose the latter, it should be managed with a Celery task for cleanup and optimization purposes.
