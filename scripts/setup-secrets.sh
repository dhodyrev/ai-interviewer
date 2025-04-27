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

# Create secrets for AWS credentials
aws secretsmanager create-secret \
    --name ai-interviewer-credentials \
    --description "AWS credentials for AI Interviewer" \
    --region $AWS_REGION

# Create secrets for database credentials
aws secretsmanager create-secret \
    --name ai-interviewer-db-credentials \
    --description "Database credentials for AI Interviewer" \
    --region $AWS_REGION

# Create secrets for JWT
aws secretsmanager create-secret \
    --name ai-interviewer-jwt-secret \
    --description "JWT secret for AI Interviewer" \
    --region $AWS_REGION

# Create secrets for OpenAI API key
aws secretsmanager create-secret \
    --name ai-interviewer-openai-key \
    --description "OpenAI API key for AI Interviewer" \
    --region $AWS_REGION

# Create secrets for Cognito configuration
aws secretsmanager create-secret \
    --name ai-interviewer-cognito-config \
    --description "Cognito configuration for AI Interviewer" \
    --region $AWS_REGION

echo "Secrets have been created. Please add the actual values using the AWS Console or CLI."
echo "Example: aws secretsmanager put-secret-value --secret-id ai-interviewer-credentials --secret-string '{\"aws_access_key_id\":\"YOUR_KEY\",\"aws_secret_access_key\":\"YOUR_SECRET\"}'" 