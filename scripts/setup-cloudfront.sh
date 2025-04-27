#!/bin/bash

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$FRONTEND_DOMAIN" ]; then
    echo "Please set AWS_REGION, AWS_ACCOUNT_ID, and FRONTEND_DOMAIN environment variables."
    exit 1
fi

# Create S3 bucket for static assets
aws s3api create-bucket \
    --bucket ai-interviewer-static-assets \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION

# Configure bucket policy
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ai-interviewer-static-assets/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket ai-interviewer-static-assets \
    --policy file://bucket-policy.json

# Create CloudFront distribution
aws cloudfront create-distribution \
    --origin-domain-name ai-interviewer-static-assets.s3.$AWS_REGION.amazonaws.com \
    --default-root-object index.html \
    --aliases $FRONTEND_DOMAIN \
    --default-cache-behavior "{
        \"TargetOriginId\": \"S3-ai-interviewer-static-assets\",
        \"ViewerProtocolPolicy\": \"redirect-to-https\",
        \"AllowedMethods\": [\"GET\", \"HEAD\", \"OPTIONS\"],
        \"CachedMethods\": [\"GET\", \"HEAD\", \"OPTIONS\"],
        \"ForwardedValues\": {
            \"QueryString\": false,
            \"Cookies\": {\"Forward\": \"none\"}
        },
        \"MinTTL\": 0,
        \"DefaultTTL\": 3600,
        \"MaxTTL\": 86400
    }" \
    --price-class PriceClass_100 \
    --enabled

# Create CloudFront invalidation
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"

echo "CloudFront distribution has been created. Please update your DNS records to point to the CloudFront domain." 