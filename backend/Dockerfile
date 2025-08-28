FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential default-libmysqlclient-dev \
  && rm -rf /var/lib/apt/lists/*
  
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
# static dir
RUN mkdir -p /app/staticfiles /app/media

# entrypoint chạy migrate + collectstatic rồi start gunicorn
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE}
EXPOSE 8000
CMD ["/entrypoint.sh"]
