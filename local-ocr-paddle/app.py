import os
import tempfile

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR

app = FastAPI(title="Shipping Documents PaddleOCR", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "https://shipping-docs.vercel.app"], allow_methods=["GET", "POST"], allow_headers=["*"])
ocr = PaddleOCR(use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False, lang="en")


@app.get("/health")
def health():
    return {"ok": True, "engine": "paddleocr"}


@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or ".jpg")[1] or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary:
        temporary.write(await file.read())
        path = temporary.name
    try:
        result = next(ocr.predict(path))
        data = result.json if hasattr(result, "json") else result
        if callable(data):
            data = data()
        data = data.get("res", data)
        texts = data.get("rec_texts", [])
        scores = data.get("rec_scores", [])
        return {"filename": file.filename, "text": "\n".join(texts), "lines": [{"text": text, "confidence": score} for text, score in zip(texts, scores)]}
    finally:
        os.remove(path)
