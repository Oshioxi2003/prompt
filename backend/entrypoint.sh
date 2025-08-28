#!/usr/bin/env bash
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput
# health endpoint optional
# python manage.py check --deploy || true
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 90 config.wsgi:application
