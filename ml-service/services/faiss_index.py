"""
FAISS Index Service
Builds and searches FAISS indices for fast nearest-neighbor embedding lookup.
"""

import logging
import numpy as np
import faiss

logger = logging.getLogger('ml-service.faiss_index')


def build_index(embeddings):
    """
    Build a FAISS L2 index from embedding vectors.
    
    Args:
        embeddings: List of embedding vectors (list of list of floats)
    
    Returns:
        FAISS index object
    """
    # Filter out None embeddings
    valid = [e for e in embeddings if e is not None]
    if not valid:
        return None

    dim = len(valid[0])
    vectors = np.array(valid, dtype=np.float32)

    # Use flat L2 index (exact search, fine for small datasets)
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)

    logger.info(f'Built FAISS index with {index.ntotal} vectors (dim={dim})')
    return index


def search_index(index, query_embeddings, k=5):
    """
    Search FAISS index for top-k nearest neighbors.
    
    Args:
        index: FAISS index object
        query_embeddings: List of query embedding vectors
        k: Number of nearest neighbors to return
    
    Returns:
        List of dicts with 'distances' and 'indices' for each query
    """
    if index is None or not query_embeddings:
        return []

    valid = [e for e in query_embeddings if e is not None]
    if not valid:
        return []

    queries = np.array(valid, dtype=np.float32)
    k = min(k, index.ntotal)

    distances, indices = index.search(queries, k)

    results = []
    for i in range(len(queries)):
        results.append({
            'distances': distances[i].tolist(),
            'indices': indices[i].tolist()
        })

    return results
