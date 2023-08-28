## Before first run
### docker-compose up
Before you do so, please rename file `.env.example` to `.env`. It is intentional behavior to provide `.env` file. 

## Run project
### Production mode
In terminal, type `docker-compose up`. Remember that changes in frontend will not be tracked.

### Development mode
In terminal, type `docker-compose -f docker-compose.dev.yml up`. Watch to frontend changes will be set. Use `ctrl` + `s`
when you provide change in `.tsx`/`ts` file. In terminal, you should see something like

```js
atc-webpack | <s> [webpack.Progress] 0% 
atc-webpack | 
atc-webpack | <s> [webpack.Progress] 1% setup before run
atc-webpack | <s> [webpack.Progress] 1% setup before run NodeEnvironmentPlugin
atc-webpack | <s> [webpack.Progress] 1% setup before run
atc-webpack | <s> [webpack.Progress] 2% setup run
atc-webpack | <s> [webpack.Progress] 2% setup run webpack-cli
atc-webpack | <s> [webpack.Progress] 2% setup run
atc-webpack | <s> [webpack.Progress] 4% setup normal module factory
...
atc-webpack | <s> [webpack.Progress] 100% 
atc-webpack | 
atc-django  | [28/Aug/2023 07:56:44] "GET / HTTP/1.1" 200 760
atc-django  | [28/Aug/2023 07:56:44] "GET /frontend/static/main.c8dbe57ae25aa5633d91.js HTTP/1.1" 200 17050
...
```

### Using IDE (for development mode)
If you are using IDE, ie. PyCharm, after you set up `Settings` / `Project interpreter`

and 

`Run/Debug Configurations` / `Django server`,

you need to open IDE terminal and provide `docker-compose -f docker-compose.dev.yml exec webpack npm run build-dev`. That will enable watch on frontend files.

### For Windows users (only development mode)
Please use `docker-compose.windows.yml`.

## Python type check / Typescript + Code formatting

Pipelines will not pass until you fix code formatting and type check errors both backend and frontend side.

### Backend code
Script to format backend code using `Ruff`, `black`, `mypy` is prepared in `backend/check.sh`.
To run, type `docker exec -it atc-django bash` and inside shell run script `./check.sh`



### Frontend code
Script to format backend code using `npm run check` is prepared in `frontend/check.sh` and in `scripts` in `package.json`.
To run, type `docker exec -it atc-webpack bash` and inside shell run script `./check.sh`


## Please check EXPLAIN_CODE.md

__________________________________________________________________

icons downloaded from https://www.flaticon.com/

__________________________________________________________________


# Template-Fullstack-Challenge

## Full-stack challenge

Hi! It's nice to see you here and all the best luck solving the challenge!
It based on simplified version of one of the day-to-day tasks we encounter. 

To make the coding more pleasant for you, we've taken care of basic app bootstrap, please see `docker-compose.yaml` for details.
Feel free to use different setup, add additional packages, libraries, images as you wish.

We're interested in a clean solution for the problems described in the requirements list. Besides that, we'd be looking at your whole approach to applications development: performance, code & file structure, architecture & API design, etc.


### Running the app
In order to start the example application please use `docker-compose up` and visit http://localhost:8000 in your browser.

As we like Docker and simplicity, it would be great if your solution could be started with the same `docker-compose up`.

However, if you chose not to use Docker or running your app requires extra steps like running scripts, installing extra dependencies etc. please make sure to include clear instructions and requirements. **Please keep it as simple as possible.**

### App requirements

We would like you to create a simple application that would allow the users to upload, enrich and preview `.csv` files. 
The requirements are kept simple but please feel free to extend them and show us your skill as you please. 
You are given a freedom in structuring the UI and the number of views you develop - we love creativity!

---
#### Requirement #1

*As a user I need to upload `.csv` file and be able to preview its content in a table*

Please use `users_posts_audience.csv` file for testing, it contains users' posts views data

#### Requirement #2

*As a user I would like to see the list of all files I've uploaded, so I can choose the file I want to preview*

#### Requirement #3

*As a user I would like to enrich my data file with additional details fetched from API endpoint*

- User should be able to input API endpoint for fetching external data, you can use following endpoints for testing:
https://jsonplaceholder.typicode.com/posts/, https://jsonplaceholder.typicode.com/users/
- User should be able to select key column name from data file that would be used for joining data, by default first column should be pre-selected
- User should be able to input key name for API response that would be used for the other side of join
- Based on selected keys, enriching should add all keys from the API response for each matching row as new columns  
- Enriching existing file should create a new file accessible in the listing from **Requirement #2**, original file should not be modified

## Extra hints
- We've prepared a basic setup including Django, Celery, Postgres and Redis but feel free to use different stack that you are more familiar with
- We encourage you to use a frontend framework of your choice, i.e. React, Vue
- How to start new React app: https://reactjs.org/docs/create-a-new-react-app.html
- How to start new Vue app: https://cli.vuejs.org/guide/creating-a-project.html#vue-create
