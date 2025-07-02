# Use an official Python image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy Python files
COPY backend/main.py ./

COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (change if your app runs on a different port)
EXPOSE 8000

# Command to run your FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
