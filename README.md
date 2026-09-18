# ClaimGuard AI

ClaimGuard AI is an automated medical claim processing and forensics system that uses AI to analyze hospital bills, insurance policies, and rejection letters for transparency, regulatory compliance, and fraud detection.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Python 3.10+
- **AI/ML**: Anthropic / OpenAI integration, Tesseract OCR, OpenCV

## Getting Started

1. **Clone the repository**
2. **Navigate to the backend directory**: `cd backend`
3. **Create a virtual environment**: `python -m venv venv`
4. **Activate the virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
5. **Install dependencies**: `pip install -r requirements.txt`
6. **Set up environment variables**: Copy `.env.example` to `.env` and fill in your keys.
7. **Run the server**: `uvicorn app.main:app --reload`
