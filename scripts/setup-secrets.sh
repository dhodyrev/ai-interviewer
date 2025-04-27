#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Function to create a secret in AWS Secrets Manager
create_secret() {
    local secret_name=$1
    local secret_value=$2
    
    echo "Creating secret: $secret_name"
    aws secretsmanager create-secret \
        --name "$secret_name" \
        --description "Secret for AI Interviewer application" \
        --secret-string "$secret_value" \
        --region "$AWS_REGION"
}

# Read environment variables from .env file
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# Create secrets
create_secret "ai-interviewer/db-credentials" "{\"username\":\"$DB_USERNAME\",\"password\":\"$DB_PASSWORD\"}"
create_secret "ai-interviewer/jwt-secret" "{\"secret\":\"$JWT_SECRET\"}"
create_secret "ai-interviewer/openai-api-key" "{\"key\":\"$OPENAI_API_KEY\"}"
create_secret "ai-interviewer/email-credentials" "{\"smtp_host\":\"$SMTP_HOST\",\"smtp_port\":\"$SMTP_PORT\",\"smtp_user\":\"$SMTP_USER\",\"smtp_password\":\"$SMTP_PASSWORD\"}"
create_secret "ai-interviewer/redis-credentials" "{\"host\":\"$REDIS_HOST\",\"port\":\"$REDIS_PORT\",\"password\":\"$REDIS_PASSWORD\"}"

echo "Secrets have been created successfully in AWS Secrets Manager" 