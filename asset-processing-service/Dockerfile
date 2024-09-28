FROM python:3.9-slim

# TODO: install video editing tools

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry \
    && poetry install --no-root

COPY . /app

CMD ["poetry", "run", "asset-processing-service"]
