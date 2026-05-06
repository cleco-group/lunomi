FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ops_ai.py ops_ai_api.py ./
# Note: serviceAccountKey.json tidak di-copy karena menggunakan FIREBASE_SERVICE_ACCOUNT_BASE64 env var

# Environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Run with gunicorn
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 300 ops_ai_api:app
