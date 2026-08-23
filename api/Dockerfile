FROM python:3.12

WORKDIR /code

# Install missing system libraries for OpenCV/GL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /code/requirements.txt

RUN pip install --upgrade pip

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./ /code/app

CMD ["fastapi", "run", "app/main.py", "--port", "5000"]