FROM python:3.11

ENV PYTHONUNBUFFERED 1
RUN adduser --disabled-password --gecos '' user

RUN apt-get update
RUN apt-get install -y gettext postgresql-client imagemagick vim make libpq-dev libyajl-dev && apt-get clean
RUN mkdir -p /home/user/backend

RUN pip install pip==23.1.2

ADD ./backend/requirements /home/user/backend/requirements
RUN pip install -r /home/user/backend/requirements/production.txt

ADD ./backend /home/user/backend

WORKDIR /home/user/backend
