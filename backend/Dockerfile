# Use Python 3.11 as the base image
FROM python:3.11.3

# Set the working directory inside the container
WORKDIR /backend

# Copy only requirements file first (reduces unnecessary rebuilds)
COPY ./requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code after installing dependencies
COPY . .

# Ensure Python output is unbuffered
ENV PYTHONUNBUFFERED=1

# Run the Django application with Gunicorn
CMD ["gunicorn", "--workers=4", "--threads=2", "--timeout", "120", "--bind", "0.0.0.0:5000", "src.wsgi:application"]
