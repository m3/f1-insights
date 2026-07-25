#!/bin/bash
# Script to execute F1 Data Pipeline
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$(dirname "$DIR")"

echo "🏎️ Executing F1 Insights Data Pipeline..."
cd "$PROJECT_ROOT/data_pipeline"

python3 main.py

echo "✅ Pipeline execution finished successfully."
