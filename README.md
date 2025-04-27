# AI Interviewer

AI Interviewer is a powerful application that helps product managers conduct user research interviews efficiently using AI technology. The system provides an intelligent interviewing agent that can adapt its questions based on user responses, analyze sentiment in real-time, and generate comprehensive insights from the conversations.

## Features

- **Interview Template Management**
  - Create and customize interview templates
  - Define target audience and objectives
  - Set up branching logic for dynamic conversations
  - Share templates with team members

- **AI-Powered Interviews**
  - Natural language conversation flow
  - Real-time sentiment analysis
  - Dynamic question generation
  - Context-aware follow-up questions

- **Analytics Dashboard**
  - Interview session statistics
  - Sentiment trends analysis
  - Key themes extraction
  - Actionable insights generation

- **User Management**
  - Secure authentication
  - Role-based access control
  - Team collaboration features
  - Session recording and history

## Tech Stack

- **Frontend**
  - React with TypeScript
  - Chakra UI for styling
  - Socket.IO client for real-time communication
  - React Router for navigation

- **Backend**
  - Node.js with Express
  - MongoDB for document storage
  - PostgreSQL for structured data
  - Socket.IO for WebSocket support
  - OpenAI API integration

- **Infrastructure**
  - AWS ECS for container orchestration
  - AWS Fargate for serverless compute
  - AWS RDS for PostgreSQL
  - AWS DocumentDB for MongoDB
  - AWS CloudFront for CDN
  - AWS S3 for static assets
  - AWS CloudWatch for monitoring
  - AWS Cognito for authentication
  - Docker containerization
  - Nginx reverse proxy
  - JWT authentication
  - RESTful API design

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- AWS CLI configured with appropriate credentials
- OpenAI API key
- MongoDB
- PostgreSQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-interviewer.git
   cd ai-interviewer
   ```

2. Create environment files:
   ```bash
   # Backend (.env)
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://mongodb:27017/ai-interviewer
   POSTGRES_URI=postgresql://ai_interviewer:ai_interviewer_password@postgres:5432/ai_interviewer
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   OPENAI_API_KEY=your_openai_api_key_here
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key

   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FRONTEND_URL=http://localhost:3000
   REACT_APP_AWS_REGION=your_aws_region
   REACT_APP_COGNITO_USER_POOL_ID=your_cognito_pool_id
   REACT_APP_COGNITO_CLIENT_ID=your_cognito_client_id
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Backend Development

```bash
cd backend
npm install
npm run dev
```

## AWS Infrastructure Setup

### Prerequisites
- AWS CLI installed and configured
- Appropriate AWS permissions
- Domain name for the application

### Deployment Steps

1. Initialize the infrastructure:
   ```bash
   ./scripts/setup-secrets.sh
   ./scripts/setup-monitoring.sh
   ./scripts/setup-cloudfront.sh
   ./scripts/setup-caching.sh
   ./scripts/setup-backup.sh
   ./scripts/setup-cost-optimization.sh
   ```

2. Deploy the CloudFormation stack:
   ```bash
   aws cloudformation deploy \
       --template-file aws/cloudformation.yaml \
       --stack-name ai-interviewer \
       --capabilities CAPABILITY_IAM \
       --parameter-overrides \
           Environment=production \
           DBUsername=$DB_USERNAME \
           DBPassword=$DB_PASSWORD \
           FrontendDomain=$FRONTEND_DOMAIN
   ```

3. Push the code to GitHub to trigger the CI/CD pipeline:
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

### Post-Deployment Verification

```bash
# Check ECS services
aws ecs describe-services \
    --cluster ai-interviewer-cluster \
    --services ai-interviewer-frontend ai-interviewer-backend

# Check CloudWatch alarms
aws cloudwatch describe-alarms \
    --alarm-name-prefix ai-interviewer

# Check S3 buckets
aws s3 ls | grep ai-interviewer

# Check Secrets Manager
aws secretsmanager list-secrets \
    --filter Key="name",Values="ai-interviewer"
```

## Monitoring and Maintenance

- **CloudWatch Alarms**: Monitor application health and performance
- **CloudWatch Logs**: Centralized logging for all services
- **Cost Optimization**: Automated scaling and resource management
- **Backup Strategy**: Daily backups of databases and static assets
- **Security**: Regular security updates and vulnerability scanning

## API Documentation

The API documentation is available at `/api/docs` when running the backend server. It includes detailed information about all available endpoints, request/response formats, and authentication requirements.

### Key Endpoints

- `/api/auth` - Authentication routes
- `/api/templates` - Interview template management
- `/api/sessions` - Interview session management
- `/api/insights` - Analytics and insights

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the GPT API
- The open-source community for the amazing tools and libraries
- All contributors who have helped to improve this project

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.

## Security

Please report any security vulnerabilities to security@yourdomain.com. We take security issues very seriously and will respond promptly.

## Roadmap

- [ ] Multi-language support
- [ ] Video/audio recording integration
- [ ] Advanced analytics dashboard
- [ ] Integration with product management tools
- [ ] Custom AI persona creation
- [ ] Template marketplace 