## Call Insights Data Lake SIPREC Parser

This directory contains code for a Lambda and instructions to deploy it to Amazon ECR for use with [Amazon Chime SDK data lake](https://docs.aws.amazon.com/chime-sdk/latest/dg/ca-data-lake.html)

### Prerequisites

1. A private Amazon ECR Repository [(read more)](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-create.html)
2. [Docker](https://docs.docker.com/get-docker/) installed
3. Valid AWS CLI credentials

### Instructions

1. Check out this repository: `git clone https://github.com/aws-samples/amazon-chime-sdk.git`
2. Navigate to docker directory: `cd amazon-chime-sdk/lambda/call-insights-parsing/docker`
3. Build the Docker image: `docker build -t siprec-parser .` [(read more)](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html)
4. Push the image to your private ECR Repository [(read more)](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html):
   1. `aws ecr get-login-password --region {REGION} | docker login --username AWS --password-stdin {AWS_ACCOUNT_ID}.dkr.ecr.{REGION}.amazonaws.com`
   2. `docker tag siprec-parser {ECR_REPO_URI}`
   3. `docker push {ECR_REPO_URI}`