from io import BytesIO

import pytesseract
from fastapi import FastAPI, File, UploadFile
from PIL import Image

app = FastAPI(title="Shipping Documents Local OCR", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True, "engine": "tesseract"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    image = Image.open(BytesIO(await file.read()))
    text = pytesseract.image_to_string(image).strip()
    return {"filename": file.filename, "text": text}
