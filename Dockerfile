# Official Python runtime as the base image
FROM python:3.9.6

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy the rest of your bot's code into the container
COPY . .

# Run the bot
CMD ["python", "download.py"]