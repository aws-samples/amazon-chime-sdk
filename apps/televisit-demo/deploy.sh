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
if ! [ -x "$(command -v cdk)" ]; then
  echo 'Error: cdk is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v git)" ]; then
  echo 'Error: git is not installed.' >&2
  exit 1
fi
echo ""
echo "Checking for Repository"
echo ""
RepositoryExists=$( aws codecommit list-repositories | jq -e '.repositories|any(.repositoryName == "televisitdemo")' )
if [[ "$RepositoryExists" == true  ]]; then
  git push https://git-codecommit.us-east-1.amazonaws.com/v1/repos/televisitdemo --all
else
  echo ""
  echo "Creating Repository"
  echo ""
  aws codecommit create-repository --repository-name televisitdemo --repository-description "Chime SDK Meeting TeleVisit Demo with Transcribe" --region us-east-1 > /dev/null 2>&1
  echo ""
  echo "Initializing Git"
  echo ""
  git init
  echo ""
  echo "Pushing to CodeCommit"
  echo ""
  git add .
  git commit -m "Initial Commit"
  git push https://git-codecommit.us-east-1.amazonaws.com/v1/repos/televisitdemo --all
fi
