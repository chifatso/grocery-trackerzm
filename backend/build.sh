
#!/usr/bin/env bash

# Stop immediately if a command fails
set -o errexit

# Install Django and other Python dependencies
python -m pip install -r requirements.txt

# Collect static files for production
python manage.py collectstatic --noinput

# Apply database migrations to PostgreSQL
python manage.py migrate
