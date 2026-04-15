# Use an official Python runtime as a parent image
FROM mcr.microsoft.com/vscode/devcontainers/base:alpine

# Set the working directory in the container
WORKDIR /workspace

# Install dependencies
RUN pip3 install --upgrade pip
RUN pip3 install 'python-dev'
RUN apt-get update
RUN apt-get install -y libssl-dev libffi-dev python3-dev build-essential

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "app.py"]