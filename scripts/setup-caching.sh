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

# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name ai-interviewer-redis-subnet-group \
    --cache-subnet-group-description "Subnet group for Redis cache" \
    --subnet-ids $SUBNET_1 $SUBNET_2 \
    --region $AWS_REGION

# Create ElastiCache security group
aws ec2 create-security-group \
    --group-name ai-interviewer-redis-sg \
    --description "Security group for Redis cache" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION

# Add ingress rule to Redis security group
aws ec2 authorize-security-group-ingress \
    --group-name ai-interviewer-redis-sg \
    --protocol tcp \
    --port 6379 \
    --source-group $ECSSecurityGroup \
    --region $AWS_REGION

# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id ai-interviewer-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name ai-interviewer-redis-subnet-group \
    --security-group-ids $REDIS_SECURITY_GROUP \
    --region $AWS_REGION

# Create secrets for Redis connection
aws secretsmanager create-secret \
    --name ai-interviewer-redis-credentials \
    --description "Redis connection details for AI Interviewer" \
    --region $AWS_REGION

echo "Redis cache has been created. Please update your application configuration to use Redis for caching." 