 #!/bin/bash
NODEVER="$(node --version)"
REQNODE="v12.0.0"
if ! [ "$(printf '%s\n' "$REQNODE" "$NODEVER" | sort -V | head -n1)" = "$REQNODE" ]; then 
    echo 'node must be version 12+'
    exit 1
fi
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v aws)" ]; then
  echo 'Error: aws is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v sam)" ]; then
  echo 'Error: sam is not installed.' >&2
  exit 1
fi
pushd backend
echo ""
echo "Building SAM"
echo ""
sam build
echo ""
echo "Deploying SAM"
echo ""
sam deploy --resolve-s3
echo ""
echo "Getting Output"
echo ""
aws cloudformation describe-stacks --stack-name chime-sdk-televisit-demo --query 'Stacks[0].Outputs' --output json > ../client/src/sam-output.json
popd
pushd client
echo ""
echo "Installing Client Dependencies"
echo ""
yarn
echo ""
echo "Building Client"
echo ""
yarn run build
echo ""
echo "Building SAM"
echo ""
sam build
echo ""
echo "Deploying Client"
echo ""
sam deploy --guided
echo ""
echo "Copying Files to S3"
WEBSITE_BUCKET=$(aws cloudformation describe-stacks --stack-name chime-sdk-televisit-frontend --query "Stacks[0].Outputs[?OutputKey=='createWebSiteS3BucketOP'].OutputValue" --output text)
aws s3 cp dist s3://$WEBSITE_BUCKET --recursive
popd