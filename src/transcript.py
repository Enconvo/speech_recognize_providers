from parakeet_mlx import from_pretrained
from huggingface_hub import hf_hub_download, try_to_load_from_cache
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import logging
import uvicorn
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Speech-to-Text API",
              description="STT service using Parakeet MLX", version="1.0.0")

# Load the model globally to avoid reloading on each request
model = None


def load_model():
    """Load the parakeet model"""
    global model
    if model is None:
        logger.info("Loading parakeet model...")
        model = from_pretrained("mlx-community/parakeet-tdt-0.6b-v2")
        logger.info("Model loaded successfully")
    return model


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    # load_model()


@app.get("/download-model")
def download_model(hf_model_id: str):
    print("download_model", hf_model_id)
    """Download the parakeet model to local directory if not exists"""
    try:
        hf_hub_download(hf_model_id, "config.json")
        hf_hub_download(hf_model_id, "model.safetensors")
        logger.info(f"Model downloaded successfully to {hf_model_id}")
        return hf_model_id

    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        raise e


@app.get("/model-status")
async def model_status(hf_model_id: str):
    """
    Check model status endpoint

    Returns:
        JSON response with model status information
    """
    try:
        # Check if model has been downloaded by checking if model files exist
        config_path = try_to_load_from_cache(hf_model_id, "config.json")
        model_path = try_to_load_from_cache(hf_model_id, "model.safetensors")

        model_exists = config_path is not None and model_path is not None
        model_dir = hf_model_id if model_exists else None

        logger.info(
            f"Model status check - Downloaded: {model_exists}, Path: {model_dir}")

        response = {
            "model_loaded": model is not None,
            "model_downloaded": model_exists,
            "model_path": model_dir if model_exists else None,
            "success": True
        }

        return JSONResponse(content=response)

    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to check model status: {str(e)}")


@app.post("/stt")
async def speech_to_text(request: dict):
    """
    Speech-to-text endpoint

    Args:
        file_path: Path to the audio file to transcribe (supported formats: wav, mp3, etc.)

    Returns:
        JSON response with transcription text
    """
    try:
        file_path = request.get("file_path")
        if not file_path:
            raise HTTPException(
                status_code=400, detail="file_path is required in request body")
        # Validate file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")

        # Get the loaded model
        current_model = load_model()

        # Transcribe the audio file
        logger.info(f"Transcribing audio file: {file_path}")
        result = current_model.transcribe(file_path)

        # Return the transcription result
        response = {
            "text": result.text,
            "success": True,
            "file_path": file_path
        }

        logger.info("Transcription completed successfully")
        return JSONResponse(content=response)

    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Transcription failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "service": "STT API"
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Speech-to-Text API",
        "version": "1.0.0",
        "endpoints": {
            "POST /stt": "Upload audio file for transcription",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        }
    }


def main():
    """Main function to start the FastAPI server"""
    # Get configuration from environment variables
    port = int(os.environ.get('PORT', 8000))
    host = os.environ.get('HOST', '0.0.0.0')

    logger.info(f"Starting STT FastAPI server on {host}:{port}")

    # Start the server using uvicorn
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )


if __name__ == "__main__":
    main()
