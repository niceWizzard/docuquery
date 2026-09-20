from contextlib import asynccontextmanager
from enum import Enum
import io
import logging
import os
from fastapi import BackgroundTasks, Depends, FastAPI, Request, status
from fastapi.concurrency import run_in_threadpool
import httpx
from PIL import Image
import pypdfium2 as pdfium
import pytesseract
from pydantic import BaseModel, HttpUrl
import uvicorn

# Ensure Tesseract can find eng.traineddata (standard path on CachyOS / Arch)
if "TESSDATA_PREFIX" not in os.environ:
    os.environ["TESSDATA_PREFIX"] = "/usr/share/tessdata/"

logging.basicConfig(level=logging.INFO)


class UploadStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELED = "cancelled"
    FAILED = "failed"


class OCRService:
    """Handles parsing image/PDF bytes and running pytesseract OCR."""

    def _bytes_to_images(self, file_bytes: bytes) -> list[Image.Image]:
        images: list[Image.Image] = []

        # Check if file is a PDF (PDF magic number '%PDF')
        if file_bytes.startswith(b"%PDF"):
            pdf = pdfium.PdfDocument(file_bytes)
            for page in pdf:
                # scale=2.0 renders at ~144 DPI for better OCR accuracy
                pil_image = page.render(scale=2.0).to_pil()
                images.append(pil_image)
        else:
            # Handle standard formats (PNG, JPG, WebP, TIFF)
            image = Image.open(io.BytesIO(file_bytes))
            if image.mode != "RGB":
                image = image.convert("RGB")
            images.append(image)

        return images

    def predict_from_bytes(self, file_bytes: bytes) -> list[str]:
        images = self._bytes_to_images(file_bytes)

        pages_text: list[str] = []
        for img in images:
            text = pytesseract.image_to_string(img)
            pages_text.append(text.strip())

        return pages_text


ocr_service = OCRService()


class AsyncOCRRequest(BaseModel):
    upload_id: int
    image_url: HttpUrl
    callback_url: HttpUrl
    secret_token: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Shared async HTTP client for connection pooling across background tasks
    http_client = httpx.AsyncClient(timeout=60.0)
    app.state.http_client = http_client
    app.state.ocr_service = ocr_service

    yield

    await http_client.aclose()


app = FastAPI(lifespan=lifespan)


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_ocr_service(request: Request) -> OCRService:
    return request.app.state.ocr_service


async def process_ocr_task(
    payload: AsyncOCRRequest,
    client: httpx.AsyncClient,
    ocr: OCRService,
):
    callback_headers = {}
    if payload.secret_token:
        callback_headers["X-Webhook-Secret"] = payload.secret_token

    try:
        logging.info(f"Starting async OCR processing for upload ID {payload.upload_id}")

        # 1. Notify webhook that the job is now processing
        try:
            await client.post(
                str(payload.callback_url),
                json={
                    "upload_id": payload.upload_id,
                    "status": UploadStatus.PROCESSING.value,
                    "text": None,
                    "error": None,
                },
                headers=callback_headers,
            )
        except Exception as cb_err:
            logging.warning(f"Failed to post 'processing' status for ID {payload.upload_id}: {cb_err}")

        # 2. Fetch the file
        res = await client.get(str(payload.image_url))
        res.raise_for_status()
        file_bytes = res.content

        # 3. Run CPU-bound OCR in a background thread to avoid blocking the async event loop
        extracted_texts = await run_in_threadpool(ocr.predict_from_bytes, file_bytes)

        # 4. Notify webhook of successful completion
        completed_payload = {
            "upload_id": payload.upload_id,
            "status": UploadStatus.COMPLETED.value,
            "text": extracted_texts,
            "error": None,
        }
        logging.info(f"OCR successful for upload ID {payload.upload_id}, notifying {payload.callback_url}")
        cb_res = await client.post(
            str(payload.callback_url),
            json=completed_payload,
            headers=callback_headers,
        )
        cb_res.raise_for_status()

    except Exception as e:
        error_msg = str(e)
        logging.error(f"OCR failed for upload ID {payload.upload_id}: {error_msg}")
        failed_payload = {
            "upload_id": payload.upload_id,
            "status": UploadStatus.FAILED.value,
            "text": [],
            "error": error_msg,
        }
        try:
            await client.post(
                str(payload.callback_url),
                json=failed_payload,
                headers=callback_headers,
            )
        except Exception as cb_err:
            logging.error(f"Failed to post failure callback for upload ID {payload.upload_id}: {cb_err}")


@app.post("/ocr/process", status_code=status.HTTP_202_ACCEPTED)
async def process_ocr(
    payload: AsyncOCRRequest,
    background_tasks: BackgroundTasks,
    client: httpx.AsyncClient = Depends(get_http_client),
    ocr: OCRService = Depends(get_ocr_service),
):
    background_tasks.add_task(process_ocr_task, payload, client, ocr)
    return {
        "status": UploadStatus.PENDING.value,
        "upload_id": payload.upload_id,
        "message": "OCR process has been queued successfully.",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)