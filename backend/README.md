# Sequence Sim Python Backend

This is the backend service for the Sequence Sim application, built using FastAPI. It provides RESTful APIs to handle sequence simulation requests. Deployed to Hugging Face Spaces.

## Running locally using Linux or Git Bash

Note: Run these commands after changing to the `backend` directory:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
```

After the installation completes, `uvicorn` will be available and you can run:

```bash
uvicorn app:app --host 0.0.0.0 --port 7860
```

## Running using Docker

The Dockerfile is primarily used for deployment to Hugging Face Spaces, but can be run locally as well.

To use Docker you need to install Docker Desktop. Once installed, in the root of the project, run:

```bash
docker build -t sequence-sim-backend .
docker run -p 7860:7860 -it sequence-sim-backend
```

You can use Ctrl+C to stop the container.

Note: The build takes some time when first run as it needs to download and install missing layers. You will need to re-run the build if any source files change.

