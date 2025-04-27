#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Please set AWS_REGION and AWS_ACCOUNT_ID environment variables."
    exit 1
fi

# Create backup vault
aws backup create-backup-vault \
    --backup-vault-name ai-interviewer-backup-vault \
    --region $AWS_REGION

# Create backup plan
aws backup create-backup-plan \
    --backup-plan "{
        \"BackupPlanName\": \"ai-interviewer-backup-plan\",
        \"Rules\": [
            {
                \"RuleName\": \"DailyBackup\",
                \"TargetBackupVaultName\": \"ai-interviewer-backup-vault\",
                \"ScheduleExpression\": \"cron(0 5 ? * * *)\",
                \"StartWindowMinutes\": 60,
                \"CompletionWindowMinutes\": 120,
                \"Lifecycle\": {
                    \"DeleteAfterDays\": 30
                }
            }
        ]
    }" \
    --region $AWS_REGION

# Create selection for RDS backup
aws backup create-backup-selection \
    --backup-plan-id $BACKUP_PLAN_ID \
    --backup-selection "{
        \"SelectionName\": \"RDSBackup\",
        \"IamRoleArn\": \"arn:aws:iam::$AWS_ACCOUNT_ID:role/service-role/AWSBackupDefaultServiceRole\",
        \"Resources\": [
            \"arn:aws:rds:$AWS_REGION:$AWS_ACCOUNT_ID:db:ai-interviewer-postgres\"
        ]
    }" \
    --region $AWS_REGION

# Create selection for DocumentDB backup
aws backup create-backup-selection \
    --backup-plan-id $BACKUP_PLAN_ID \
    --backup-selection "{
        \"SelectionName\": \"DocumentDBBackup\",
        \"IamRoleArn\": \"arn:aws:iam::$AWS_ACCOUNT_ID:role/service-role/AWSBackupDefaultServiceRole\",
        \"Resources\": [
            \"arn:aws:docdb:$AWS_REGION:$AWS_ACCOUNT_ID:cluster:ai-interviewer-docdb\"
        ]
    }" \
    --region $AWS_REGION

# Create S3 bucket for disaster recovery
aws s3api create-bucket \
    --bucket ai-interviewer-dr \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION

# Configure bucket versioning
aws s3api put-bucket-versioning \
    --bucket ai-interviewer-dr \
    --versioning-configuration Status=Enabled \
    --region $AWS_REGION

# Configure bucket lifecycle
aws s3api put-bucket-lifecycle-configuration \
    --bucket ai-interviewer-dr \
    --lifecycle-configuration "{
        \"Rules\": [
            {
                \"ID\": \"MoveToIA\",
                \"Status\": \"Enabled\",
                \"Transitions\": [
                    {
                        \"Days\": 30,
                        \"StorageClass\": \"STANDARD_IA\"
                    }
                ]
            }
        ]
    }" \
    --region $AWS_REGION

echo "Backup and disaster recovery setup is complete. Please test the backup and restore procedures." 