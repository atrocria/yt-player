# Official Python runtime as the base image from the Dockerhub
FROM python:3.9.6

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install necessary packages
RUN pip install -r requirements.txt

# Copy all project files into the container
COPY . /app

# Expose port 5000 for Flask
EXPOSE 5000

# Environment for development mode to automatically detect changes
ENV FLASK_ENV=development

# Command to run the server
CMD ["python", "server.py"]
