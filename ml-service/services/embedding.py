"""
CLIP Embedding Service
Uses OpenAI CLIP model to generate image embeddings for semantic similarity.
"""

import logging
import torch
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

logger = logging.getLogger('ml-service.embedding')

# ─── Singleton Model Loader ─────────────────────────────────────
# Load model once at module level to avoid reloading on every request

_model = None
_processor = None
_device = None

MODEL_NAME = 'openai/clip-vit-base-patch32'


def _load_model():
    """Load CLIP model and processor (singleton pattern)."""
    global _model, _processor, _device

    if _model is not None:
        return

    logger.info(f'Loading CLIP model: {MODEL_NAME}')
    
    _device = 'cuda' if torch.cuda.is_available() else 'cpu'
    logger.info(f'Using device: {_device}')

    _model = CLIPModel.from_pretrained(MODEL_NAME).to(_device)
    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    
    # Set to eval mode for inference
    _model.eval()
    
    logger.info('CLIP model loaded successfully')


def compute_embeddings(image_paths):
    """
    Compute CLIP image embeddings for a list of images.
    
    Args:
        image_paths: List of absolute paths to images
    
    Returns:
        List of embedding vectors (each is a list of floats, 512-dim)
    """
    _load_model()
    
    embeddings = []
    
    for path in image_paths:
        try:
            img = Image.open(path).convert('RGB')
            
            # Process image through CLIP
            inputs = _processor(images=img, return_tensors='pt').to(_device)
            
            with torch.no_grad():
                image_features = _model.get_image_features(**inputs)
            
            # Normalize the embedding (L2 normalization for cosine similarity)
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
            
            # Convert to list of floats
            embedding = image_features.squeeze().cpu().numpy().tolist()
            embeddings.append(embedding)
            
            logger.debug(f'Computed embedding for {path} (dim={len(embedding)})')
            
        except Exception as e:
            logger.warning(f'Failed to compute embedding for {path}: {str(e)}')
            # Append None for failed embeddings (will be handled in similarity)
            embeddings.append(None)
    
    return embeddings
