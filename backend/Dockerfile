# syntax=docker/dockerfile:1

FROM python:3.11.3

#create backend folder if not present
RUN mkdir -p /backend
WORKDIR /backend

#ensure that python output is sent to terminal and not buffered
ENV PYTHONUNBUFFERED=1

# Copy and install python requirements
COPY ./requirements.txt ./
RUN pip3 install -r requirements.txt


# # Run Flask app
# EXPOSE 5000
# RUN cd src
# #ENV FLASK_APP="./src/app.py" FLASK_ENV=docker FLASK_DEBUG=true
# #CMD ["python3", "src/app.py"]
# CMD ["flask", "--app", "src/app", "--debug", "run", "--host", "0.0.0.0"]
# #CMD tail -f /dev/null