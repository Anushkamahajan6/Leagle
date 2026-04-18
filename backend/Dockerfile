# Use Python 3.12 slim for a smaller footprint
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies (e.g., for psycopg2 or other libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Note: On HF Space (16GB), we can comfortably run torch/sentence-transformers
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port Hugging Face expects (7860)
EXPOSE 7860

# Run the FastAPI app using uvicorn
# We use --host 0.0.0.0 and --port 7860 as required by HF Spaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
