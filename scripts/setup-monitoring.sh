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

# Create CloudWatch alarm for CPU utilization
aws cloudwatch put-metric-alarm \
    --alarm-name ai-interviewer-cpu-utilization \
    --alarm-description "Alarm when CPU utilization exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:ai-interviewer-alerts \
    --dimensions Name=ClusterName,Value=ai-interviewer-cluster \
    --region $AWS_REGION

# Create CloudWatch alarm for memory utilization
aws cloudwatch put-metric-alarm \
    --alarm-name ai-interviewer-memory-utilization \
    --alarm-description "Alarm when memory utilization exceeds 80%" \
    --metric-name MemoryUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:ai-interviewer-alerts \
    --dimensions Name=ClusterName,Value=ai-interviewer-cluster \
    --region $AWS_REGION

# Create CloudWatch alarm for HTTP 5xx errors
aws cloudwatch put-metric-alarm \
    --alarm-name ai-interviewer-http-5xx \
    --alarm-description "Alarm when HTTP 5xx errors exceed threshold" \
    --metric-name HTTPCode_Target_5XX_Count \
    --namespace AWS/ApplicationELB \
    --statistic Sum \
    --period 60 \
    --threshold 10 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1 \
    --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:ai-interviewer-alerts \
    --dimensions Name=LoadBalancer,Value=ai-interviewer-alb \
    --region $AWS_REGION

# Create CloudWatch alarm for database connections
aws cloudwatch put-metric-alarm \
    --alarm-name ai-interviewer-db-connections \
    --alarm-description "Alarm when database connections exceed threshold" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:$AWS_REGION:$AWS_ACCOUNT_ID:ai-interviewer-alerts \
    --dimensions Name=DBInstanceIdentifier,Value=ai-interviewer-postgres \
    --region $AWS_REGION

# Create SNS topic for alerts
aws sns create-topic \
    --name ai-interviewer-alerts \
    --region $AWS_REGION

echo "CloudWatch alarms and SNS topic have been created. Please subscribe to the SNS topic to receive alerts." 