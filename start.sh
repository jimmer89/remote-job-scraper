#!/bin/bash
# Start script for Railway
PORT=${PORT:-8000}
exec uvicorn src.api:app --host 0.0.0.0 --port "$PORT"
