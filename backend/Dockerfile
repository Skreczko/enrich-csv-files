FROM python:3.11

ENV PYTHONUNBUFFERED 1

RUN apt-get update
RUN apt-get install -y gettext postgresql-client imagemagick vim make libpq-dev && apt-get clean
RUN mkdir -p /backend/code

RUN pip install pip==23.1.2

ADD ./backend/requirements /backend/code/requirements
RUN pip install -r /backend/code/requirements/production.txt

RUN pip install -r /backend/code/requirements/requirements-development.txt

ADD .. /backend/code/

WORKDIR /backend/code