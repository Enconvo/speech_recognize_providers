from parakeet_mlx import from_pretrained
from huggingface_hub import hf_hub_download, try_to_load_from_cache, snapshot_download
import socket
from pathlib import Path
import os
import logging
from mcp.server.fastmcp import FastMCP
import json

# Configure logging to stderr (safe for STDIO-based MCP servers)
logging.basicConfig(level=logging.INFO, stream=None)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("speech-to-text")

# Constants
USER_AGENT = "speech-to-text-mcp/1.0"

# Load the model globally to avoid reloading on each request
model = None


def load_model():
    """Load the parakeet model"""
    global model
    if model is None:
        send_message_to_app({
            "type": "messages",
            "messages": [
                {
                    "role": "assistant",
                    "id": "123",
                    "content": [{
                            "id": "12323",
                            "type": "loading_indicator",
                            "text": "Loading parakeet model..."
                    }]
                }
            ],
            "action": "overwrite_last_message_last_content_of_type"
        })
        logger.info("Loading parakeet model...")
        model = from_pretrained("mlx-community/parakeet-tdt-0.6b-v2")
        logger.info("Model loaded successfully")
    return model


def send_message_to_app(content: dict) -> None:
    """Send message to app via socket connection.

    Args:
        output: Dictionary containing the message data to send
    """

    try:
        sock = create_socket_client()

        callId = "speech_recognize_providers|parakeet_mlx"
        requestId = "123"

        output = {
            "method": "responseStream",
            "callId": callId,
            "requestId": requestId,
            "payloads": content,
            "type": "request",
            "needResult": False,
            "extensionName": "speech_recognize_providers",
            "commandName": "parakeet_mlx"
        }

        message = json.dumps(output) + "\n"
        sock.send(message.encode('utf-8'))


    except socket.timeout:
        logger.error("Socket connection timeout")
    except socket.error as e:
        logger.error(f"Socket connection error: {e}")
    except Exception as e:
        logger.error(f"Failed to send message to app: {e}")
    finally:
        logger.info("Message sent to app finished")


def create_socket_client():
    """Create and return a socket client connection.

    Returns:
        socket.socket or None: Socket connection if successful, None otherwise
    """

    try:
        # Get socket path from user's home directory
        home_dir = Path.home()
        socket_path = home_dir / ".config" / "enconvo" / ".macopilot.socket"

        # Create Unix domain socket
        app_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        app_socket.settimeout(5)  # Set 5 second timeout

        # Connect to socket
        app_socket.connect(str(socket_path))
        logger.info(f"Socket connected to {socket_path}")

        return app_socket

    except socket.timeout:
        logger.error("Socket connection timeout")
        return None
    except socket.error as e:
        logger.error(f"Socket connection error: {e}")
        return None
    except Exception as e:
        logger.error(f"Socket creation failed: {e}")
        return None


@mcp.tool()
async def download_model_tool(hf_model_id: str) -> str:
    """Download the parakeet model to local directory if not exists.

    Args:
        hf_model_id: Hugging Face model ID to download

    Returns:
        Status message indicating success or failure
    """
    try:
        # Download required model files
        hf_hub_download(hf_model_id, "config.json")
        hf_hub_download(hf_model_id, "model.safetensors")
        logger.info(f"Model downloaded successfully to {hf_model_id}")
        return f"Model {hf_model_id} downloaded successfully"

    except Exception as e:
        logger.error(f"Error downloading model: {str(e)}")
        return f"Failed to download model {hf_model_id}: {str(e)}"


@mcp.tool()
async def check_model_status(hf_model_id: str) -> str:
    """Check if a model has been downloaded and is available.

    Args:
        hf_model_id: Hugging Face model ID to check

    Returns:
        Model status information
    """
    try:
        # Check if model files exist in cache
        config_path = try_to_load_from_cache(hf_model_id, "config.json")
        model_path = try_to_load_from_cache(hf_model_id, "model.safetensors")

        model_exists = config_path is not None and model_path is not None

        return model_exists

    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        return f"Failed to check model status for {hf_model_id}: {str(e)}"


@mcp.tool()
async def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file to text using the speech-to-text model.

    Args:
        file_path: Path to the audio file to transcribe (supported formats: wav, mp3, etc.)

    Returns:
        Transcribed text from the audio file
    """
    try:
        # Validate file exists
        if not os.path.exists(file_path):
            return f"Error: Audio file not found at path: {file_path}"

        # Get the loaded model
        current_model = load_model()

        # Transcribe the audio file
        result = current_model.transcribe(file_path)

        return result.text

    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        return f"Transcription failed for {file_path}: {str(e)}"


@mcp.tool()
async def get_server_health() -> str:
    """Get the health status of the speech-to-text server.

    Returns:
        Server health information including model status
    """
    try:
        health_status = f"""
Speech-to-Text Server Health:
- Status: Healthy
- Model loaded: {model is not None}
- Service: STT MCP Server
- Version: 1.0.0
"""
        return health_status

    except Exception as e:
        logger.error(f"Error checking server health: {str(e)}")
        return f"Health check failed: {str(e)}"


def main():
    logger.info("Starting STT MCP Server in STDIO mode")
    mcp.run(transport='stdio')


if __name__ == "__main__":
    main()
