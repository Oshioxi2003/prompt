# Multi-stage build để optimize image size
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN addgroup --system django && adduser --system --group django

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist/

# Create media and static directories
RUN mkdir -p /app/media /app/static

# Change ownership
RUN chown -R django:django /app

# Switch to django user
USER django

# Expose port
EXPOSE 8000

# Collect static files and run server
CMD ["sh", "-c", "cd backend && python manage.py collectstatic --noinput && python manage.py migrate && gunicorn prompt_library.wsgi:application --bind 0.0.0.0:8000"]
