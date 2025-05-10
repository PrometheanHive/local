# Use Python 3.11 as the base image
FROM python:3.11.3-slim

# Set the working directory inside the container
WORKDIR /backend

# Install system dependencies for GDAL/GeoDjango support
RUN apt-get update && apt-get install -y \
    binutils \
    libproj-dev \
    gdal-bin \
    gcc \
    libgdal-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables so Django can find GDAL
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so

# Copy requirements and install Python packages
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Ensure Python output is unbuffered
ENV PYTHONUNBUFFERED=1

# Start Gunicorn server
CMD ["gunicorn", "--workers=4", "--threads=2", "--timeout", "120", "--bind", "0.0.0.0:5000", "src.wsgi:application"]
