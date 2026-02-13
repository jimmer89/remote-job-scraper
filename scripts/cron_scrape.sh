#!/bin/bash
# Cron script for automated job scraping
# Add to crontab: 0 */6 * * * /path/to/remote-job-scraper/scripts/cron_scrape.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/scrape_$(date +%Y%m%d_%H%M%S).log"

cd "$PROJECT_DIR"

# Activate virtual environment
source venv/bin/activate

# Run scraper
echo "Starting scrape at $(date)" >> "$LOG_FILE"
python src/main.py scrape >> "$LOG_FILE" 2>&1
echo "Finished at $(date)" >> "$LOG_FILE"

# Keep only last 10 log files
ls -t "$PROJECT_DIR/logs/scrape_"*.log 2>/dev/null | tail -n +11 | xargs -r rm

# Deactivate
deactivate
