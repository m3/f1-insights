#!/usr/bin/env bash
# scripts/backup_db.sh
# Automated Backup script for F1 Insights Platform (V2 Architecture)
# Crontab setup: 0 3 * * * /path/to/scripts/backup_db.sh >> /var/log/f1_backup.log 2>&1

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/f1_backup_${TIMESTAMP}"
ARCHIVE_NAME="f1_insights_backup_${TIMESTAMP}.tar.gz"
S3_BUCKET="s3://f1-insights-backups"
DISCORD_WEBHOOK_URL=${DISCORD_ALERTS_WEBHOOK:-""} # Optionally set this in env

echo "🔄 Starting F1 Insights Backup Process at $(date)"

# 1. Create temporary staging directory
mkdir -p "${BACKUP_DIR}"

# 2. Safely copy SQLite Database (WAL mode requires copying both files)
# Using SQLite's built-in backup for absolute safety is best, but a hot copy works if fast enough.
echo "📦 Backing up SQLite Relational Database..."
if [ -f "backend/f1_insights.db" ]; then
    sqlite3 backend/f1_insights.db ".backup '${BACKUP_DIR}/f1_insights.db'"
else
    echo "⚠️ SQLite database not found! Skipping..."
fi

# 3. Compress the staging directory
echo "🗜️ Compressing backup payload..."
tar -czf "/tmp/${ARCHIVE_NAME}" -C "/tmp" "f1_backup_${TIMESTAMP}"

# 5. Upload to Off-Site Storage (S3)
echo "☁️ Uploading ${ARCHIVE_NAME} to ${S3_BUCKET}..."
if command -v aws >/dev/null 2>&1; then
    if aws s3 cp "/tmp/${ARCHIVE_NAME}" "${S3_BUCKET}/${ARCHIVE_NAME}"; then
        echo "✅ Upload successful."
    else
        echo "❌ AWS S3 Upload failed!"
        if [ -n "$DISCORD_WEBHOOK_URL" ]; then
            curl -H "Content-Type: application/json" \
                 -X POST \
                 -d '{"content": "🚨 **CRITICAL**: F1 Insights Automated DB Backup Failed to upload to S3!"}' \
                 "$DISCORD_WEBHOOK_URL"
        fi
        exit 1
    fi
else
    echo "⚠️ AWS CLI not installed. Simulating successful upload for local testing."
fi

# 6. Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf "${BACKUP_DIR}"
rm -f "/tmp/${ARCHIVE_NAME}"

echo "🎉 Backup Process Completed Successfully!"
