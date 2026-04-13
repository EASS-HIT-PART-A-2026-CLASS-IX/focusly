FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copy app and worker code
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY worker/ ./worker/

CMD ["uv", "run", "python", "worker/main.py"]
