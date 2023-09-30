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
* modifying endpoint to create possibility to obtain chunks, and then merging them with petl. it may solve problems with internet disconnection,optimalization
* As we can enrich files - we can add additional csv list view as "tree", where user can select that and see "root" file, and expand to see which files were created using that root file, ie https://primereact.org/treetable/ 




# TODO
* `Sentry` has default setup. May be required to add additional sentry envs for local/test/prod
