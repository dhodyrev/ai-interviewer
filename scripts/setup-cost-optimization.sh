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

# Create budget
aws budgets create-budget \
    --account-id $AWS_ACCOUNT_ID \
    --budget "{
        \"BudgetName\": \"ai-interviewer-budget\",
        \"BudgetLimit\": {
            \"Amount\": \"100\",
            \"Unit\": \"USD\"
        },
        \"TimeUnit\": \"MONTHLY\",
        \"BudgetType\": \"COST\",
        \"CostFilters\": {
            \"Service\": [\"Amazon Elastic Container Service\", \"Amazon RDS\", \"Amazon DocumentDB\"]
        }
    }" \
    --notifications-with-subscribers "[
        {
            \"Notification\": {
                \"NotificationType\": \"ACTUAL\",
                \"ComparisonOperator\": \"GREATER_THAN\",
                \"Threshold\": 80,
                \"ThresholdType\": \"PERCENTAGE\"
            },
            \"Subscribers\": [
                {
                    \"SubscriptionType\": \"EMAIL\",
                    \"Address\": \"$ALERT_EMAIL\"
                }
            ]
        }
    ]" \
    --region $AWS_REGION

# Create cost anomaly detection
aws ce create-anomaly-monitor \
    --anomaly-monitor "{
        \"MonitorName\": \"ai-interviewer-cost-anomaly\",
        \"MonitorType\": \"CUSTOM\",
        \"MonitorDimension\": \"SERVICE\",
        \"MonitorSpecification\": \"{\\\"Dimensions\\\":{\\\"Service\\\":[\\\"Amazon Elastic Container Service\\\",\\\"Amazon RDS\\\",\\\"Amazon DocumentDB\\\"]}}\"
    }" \
    --region $AWS_REGION

# Create cost allocation tags
aws ce create-cost-allocation-tags \
    --cost-allocation-tags "ai-interviewer-environment" "ai-interviewer-service" \
    --region $AWS_REGION

# Enable cost explorer
aws ce update-preferences \
    --preferences "{
        \"CostExplorer\": {
            \"Enabled\": true
        }
    }" \
    --region $AWS_REGION

# Create S3 lifecycle policy for logs
aws s3api put-bucket-lifecycle-configuration \
    --bucket ai-interviewer-logs \
    --lifecycle-configuration "{
        \"Rules\": [
            {
                \"ID\": \"LogRetention\",
                \"Status\": \"Enabled\",
                \"Expiration\": {
                    \"Days\": 30
                },
                \"Transitions\": [
                    {
                        \"Days\": 7,
                        \"StorageClass\": \"STANDARD_IA\"
                    }
                ]
            }
        ]
    }" \
    --region $AWS_REGION

echo "Cost optimization setup is complete. Please monitor your costs regularly." 