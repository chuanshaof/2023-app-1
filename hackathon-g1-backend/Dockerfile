FROM python:3.9

WORKDIR /be

COPY ./requirements.txt /be/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /be/requirements.txt

COPY ./app /be/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]