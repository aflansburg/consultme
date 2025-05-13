#!/bin/bash
set -e

# Check if required arguments are provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 <service-name> <project-id> <region>"
    echo "Example: $0 myapp my-gcp-project us-central1"
    echo "Available regions: (run 'gcloud compute regions list' to see all options)"
    exit 1
fi

SERVICE_NAME=$1
PROJECT_ID=$2
REGION=$3

# Check if gcloud is authenticated
echo "Checking authentication status..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "Error: Not authenticated with gcloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Verify and set the project
echo "Verifying project..."
if ! gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
    echo "Error: Project $PROJECT_ID not found or not accessible."
    exit 1
fi

# Verify the region exists
echo "Verifying region..."
if ! gcloud compute regions list --format="value(name)" | grep -q "^$REGION$"; then
    echo "Error: Region $REGION is not valid."
    echo "Available regions:"
    gcloud compute regions list --format="table[box](name,description)"
    exit 1
fi

# Show project details and confirm
echo -e "\nProject Details:"
echo "=================="
gcloud projects describe $PROJECT_ID --format="table[box](
    projectId,
    name,
    projectNumber,
    lifecycleState
)"

# Prompt for confirmation
echo -e "\nYou are about to deploy to the above project."
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
read -p "Is this correct? (y/N) " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Set the project
echo -e "\nSetting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

echo "Executing Cloud Build pipeline..."
gcloud builds submit --config=cloudbuild.yaml --substitutions=_SERVICE_NAME=$SERVICE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME --image gcr.io/$PROJECT_ID/$SERVICE_NAME --platform managed --allow-unauthenticated --region $REGION