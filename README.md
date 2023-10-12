## Before first run
* Before you do so, please rename file `backend/.env.example` to `backend/.env`. It is intentional behavior to provide `.env` file. 
* Dont forget to set `DEBUG=True` in `.env` if you want to start developing server!
* To manage containers, you can use 
```shell
docker-compose run --rm django bash
```
or
```shell
docker exec -it atc-django bash
```

Below, second option will be used.

## Run project
### Production mode
In terminal, type 
```shell
docker-compose up
```
Remember that changes in frontend will not be tracked.

the name of `docker-compose.yml` should be `docker-compose.prod.yml` - to rename in future development

### Development mode
In terminal, type 
```shell
docker-compose -f docker-compose.dev.yml up
```
Watch to frontend changes will be set. Use `ctrl` + `s`
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

#### Pycharm
* Set up `Project interpreter`, using `docker-compose.dev.yml` file. Use `django` service.

* Set up `Project structure`, as `Source Folders`(blue) select `backend`, as `Template Folders` use `frontend/templates`

* From toolbar select `Run/Debug Configurations` / `Django server`,

* Correctly set up `Working directory` (its input), as `<your_project_directory_root>/Fullstack-Challenge-DawidS/backend`

* To confirm, run `Django server` and use command below,
Type 
```shell
docker exec -it atc-django bash
```
you should see something like `root@868056ecf804:/opt/project/backend# `


> <u><b>Important:</b></u>
> 
>In the Docker configuration, the `node_modules` directory is set as an anonymous volume, which means it's isolated from the host system and changes inside the container won't affect the local `node_modules` directory and vice versa.
>
>* goto `package.json`
>* you got hint to install packages
>* if error occurred (permissions to add), please remove `node_modules` file which were created automatically (and which is empty) OR change permissions on that directory (`sudo chmod 777 node_modules/`)

<u><b>Important: Run Celery in container with script</b></u>
* there is an isssue with celery for running server using pycharm's django server. You need to run celery/celery-beat manually in container after you run this project with django server
- run your project with green arrow
- Type
```shell
docker exec -it atc-django bash -c "watchmedo auto-restart --pattern '*.py' --signal SIGINT --recursive -- celery -A transformer worker -l debug"
```

<u><b>Important: Run Celery Beat in container with script</b></u>

do same for celery-beat in other terminal:
```shell
docker exec -it atc-django bash -c "watchmedo auto-restart --pattern '*.py' --signal SIGINT --recursive -- celery -A transformer beat -l debug"
```

<u>that issue will be fixed in future development</u>

### For Windows users (only development mode)
Please use `docker-compose.windows.yml`.


## First steps


* Goto http://localhost:8000 in your browser, check if all files (png/js/css) were imported correctly

## Commands

Pipelines will not pass until you fix code formatting and type check errors both backend and frontend side.

> Info: Use development mode

### Backend code
Script to format backend code using `Ruff`, `black`, `mypy` is prepared in `backend/check.sh`.
Run `atc-django` container
```shell
docker exec -it atc-django bash -c "./check.sh"
```

To format `*.py` files, use this command

```shell
docker exec -it atc-django bash -c "black ."
```

### Frontend code
Script to format backend code using `npm run check` is prepared in `frontend/check.sh` and in `scripts` in `package.json`.
Run `atc-webpack` container
```shell
docker exec -it atc-webpack bash -c "./check.sh"
```

to format frontend files, use this command
```shell
docker exec -it atc-webpack bash -c "npm run prettier"
```

## Tests
> Info: Use development mode

To run tests, use the following command:
```shell
docker-compose -f docker-compose.dev.yml exec django pytest
```

## Code Coverage Check in CI/CD
> Info: Use development mode

To execute the coverage check locally, run:

For backend:
```shell
docker exec -it atc-django bash -c "./scripts/run-coverage-check.sh"
```

For frontend:
```shell
docker exec -it atc-webpack bash -c "./scripts/run-coverage-check.sh"
```

This script fetches the latest coverage report from the `main` branch on GitHub (stored as artifacts) and compares it with your local coverage. It's crucial to ensure that your code either maintains or improves upon the existing coverage. If there's a regression compared to the `main` branch or if the coverage doesn't meet a minimum of 80%, the workflow will fail.

Files that are ignored during the backend coverage check are specified in the `.coveragerc` file.

Files that are ignored during the frontend coverage check are specified in the `jest.config.json` file.

Coverage files are removed in the last step. If you want to keep them, remove the line:

```plaintext
rm -f coverage.xml previous-coverage.xml .coverage
```

### Frontend Custom Rendering for Tests

Our app's components are often wrapped within Redux's `Provider` and React Router's `Router` to access the app's state and routing features, respectively. Therefore, a custom rendering method is used in tests to replicate this environment.

```typescript
testing-utils.tsx

function render(
  ui: React.ReactElement,
  extraReducers: ValidateSliceCaseReducers<any, any>[] = [],
  options: RenderOptions = {},
): {
  store: { getState: () => RootState; dispatch: Dispatch<AnyAction> };
  renderResult: RenderResult;
} {
  // ... (rest of the code)
}
```

#### Accessing Store in Tests
Thanks to our custom render method, the store is available in tests. You can access the store's state and dispatch actions, ensuring that your tests can simulate any state or event in the app.

This custom render method returns the store, which lets you directly access the state or dispatch actions within your tests. For more details, refer to the testing-utils file.

```typescript
const { store } = render(<MyComponent />);
expect(store.getState().myFeature).toEqual({/* expected state */});
```

To dispatch actions:

```typescript
store.dispatch(myAction());
```

This approach gives a more integrated and real-world scenario for testing components and ensures that your tests are robust and effective. Always refer to existing tests and the testing-utils file for best practices and utilities available for your tests.

### GitHub Workflow

Coverage check is also integrated into the GitHub workflow. When you push your changes, the workflow will automatically fetch the latest coverage from the `main` branch, compare it with the coverage of your changes, and fail the job if the criteria mentioned above are not met.

>There might be instances when you'll want to refresh the most recent coverage report. To do this, please follow these steps:
> 1. Navigate to [GitHub Actions](https://github.com/Superdevs-Recruiting/Fullstack-Challenge-DawidS/actions?query=branch%3Amain)
> 2. Choose the latest pull request.
> 3. Navigate to the Artifacts section and manually delete the coverage-report (backend) or cobertura-coverage.xml (frontend).
> 
>With this action, the subsequent run will generate a new blank coverage-report for comparison. Once you execute the coverage script afterward, the report produced will serve as the baseline for future runs.


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
