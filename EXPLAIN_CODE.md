## build project + .env
Please modify .env.example to .env. Without that action, you will not be able to build project.

## urls.py
Decided to change path to re_path, as I wanted to keep original project structure provided by Jakub.
That allowed me to pass URL paths directly to React Router

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

## Upload file section

### Frontend
* During upload process, pushing file details to redux. That allows us to unnessesary request for list of files during

