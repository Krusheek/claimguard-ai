import os
import cv2
import numpy as np
from PIL import Image
from pdf2image import convert_from_path

def preprocess_image(image_path: str) -> np.ndarray:
    """Preprocess image for OCR."""
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image from {image_path}")
        
    h, w = image.shape[:2]
    
    # Upscale if width < 1500px
    if w < 1500:
        scale_factor = 1500 / w
        image = cv2.resize(image, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Deskew
    coords = np.column_stack(np.where(gray > 0))
    angle = cv2.minAreaRect(coords)[-1]
    
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
        
    if abs(angle) > 0.5:
        (h, w) = gray.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
    # CLAHE contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    
    # Bilateral filter denoising
    gray = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    
    # Adaptive Gaussian thresholding
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 25, 11
    )
    
    # Morphological close
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    return cleaned

def pdf_to_images(pdf_path: str) -> list[str]:
    """Convert PDF pages to temporary image files."""
    images = convert_from_path(pdf_path)
    image_paths = []
    
    temp_dir = os.path.dirname(pdf_path)
    for i, img in enumerate(images):
        path = os.path.join(temp_dir, f"temp_page_{i}.png")
        img.save(path, "PNG")
        image_paths.append(path)
        
    return image_paths

def prepare_document(file_path: str) -> list[np.ndarray]:
    """Dispatcher to prepare a document (PDF or Image)."""
    ext = file_path.lower().split('.')[-1]
    
    if ext == 'pdf':
        image_paths = pdf_to_images(file_path)
        processed = [preprocess_image(path) for path in image_paths]
        # Clean up temp files
        for path in image_paths:
            if os.path.exists(path):
                os.remove(path)
        return processed
    else:
        return [preprocess_image(file_path)]
