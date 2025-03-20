# Cloud-Vault
Cloud-Vault is a cloud storage solution built on AWS S3, allowing users to:

- Create folders
- Upload files
- Delete folders
- Authenticate with Google
- Manage subscriptions with Razorpay
The project is built as a monorepo using Yarn and is hosted on AWS through the Serverless Framework.

# Features

- Folder Management: Create and delete folders seamlessly.
- File Uploads: Upload files directly to AWS S3.
- Authentication: Google OAuth 2.0 for secure user authentication.
- Subscription System: Razorpay integration for subscription payments.
- Serverless Architecture: Efficiently hosted using AWS Lambda with the Serverless Framework.
- Database Management: PostgreSQL with Prisma ORM for efficient data handling.

# Tech Stack
- Backend: AWS Lambda (Serverless Framework)
- Cloud Storage: AWS S3
- Payment Integration: Razorpay
- Authentication: Google OAuth 2.0
- Database: PostgreSQL with Prisma ORM
- Package Management: Yarn (monorepo)
- Hosting: AWS

# Prerequisites
Before running the project, make sure you have:

- Node.js installed (v14 or higher recommended).
- Yarn installed globally.
- AWS CLI set up and configured with appropriate IAM permissions.
- Razorpay account and API credentials.
- A Google Cloud project with OAuth credentials.
- PostgreSQL installed and running.
- Serverless Framework installed globally.

# Installation
1. Clone the repository:

```bash
git clone https://github.com/bansalmohit123/cloud-vault.git
cd cloud-vault
```
2. Install dependencies:

```bash
yarn install
```
3. Set up environment variables:

Create a .env file in the root directory and add the following variables:

.env
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
S3_BUCKET_NAME=your-s3-bucket-name

# Google OAuth Configuration
AUTH_GOOGLE_ID =your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_SECRET=your-auth_secret

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database-name

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# Server Configuration
SERVER_URL=your-server-url

```
# Running the Project
1. Development
Start the server locally:

```bash
yarn dev
```
This will start the project locally using the Serverless offline plugin.

2. Access the project:

Open your browser and go to http://localhost:3000.


# Deployment
1. Deploy the project to AWS:

```bash
yarn deploy
```
This command deploys the project to your specified AWS environment.

2. Verify deployment:

Access your cloud functions using the deployed endpoint URL provided by the Serverless Framework.
