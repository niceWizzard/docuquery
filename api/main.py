from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Depends, Request, HTTPException, status, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, HttpUrl
from paddlex import create_pipeline
import httpx
import cv2
import numpy as np
import pypdfium2 as pdfium

logging.basicConfig(level=logging.INFO)


class OCRRequest(BaseModel):
    image_url: HttpUrl


class AsyncOCRRequest(BaseModel):
    upload_id: int
    image_url: HttpUrl
    callback_url: HttpUrl
    secret_token: str | None = None


class PaddleXOCRService:
    def __init__(self):
        self.pipeline = None

    def initialize(self):
        self.pipeline = create_pipeline(pipeline="OCR")

    def _bytes_to_images(self, file_bytes: bytes) -> list[np.ndarray]:
        # Check PDF magic bytes (%PDF-)
        if file_bytes.startswith(b"%PDF"):
            images = []
            pdf = pdfium.PdfDocument(file_bytes)
            for page in pdf:
                # Render page to PIL image at 200 DPI for sharp OCR text
                pil_image = page.render(scale=200 / 72).to_pil()
                # Convert PIL (RGB) to OpenCV format (BGR numpy array)
                bgr_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
                images.append(bgr_img)
            return images

        # Otherwise, treat as a standard image (PNG, JPG, WEBP, etc.)
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode file. Supported formats: PDF, PNG, JPG, WEBP, etc.")
        return [img]

    def predict_from_bytes(self, file_bytes: bytes) -> list[str]:
        images = self._bytes_to_images(file_bytes)                                                                                                                  
                                                                                                                                                                        
        pages_text = []                                                                                                                                             
        for img in images:                                                                                                                                          
            output = self.pipeline.predict(img)                                                                                                                     
            page_lines = []                                                                                                                                         
            for res in output:                                                                                                                                      
                texts = res.get("rec_texts", [])
                page_lines.extend(texts)
            pages_text.append("\n".join(page_lines))

        return pages_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize PaddleX model
    ocr_service = PaddleXOCRService()
    ocr_service.initialize()
    app.state.ocr_service = ocr_service

    # Shared async HTTP client for connection pooling
    http_client = httpx.AsyncClient(timeout=30.0)
    app.state.http_client = http_client

    yield

    # Teardown
    await http_client.aclose()
    app.state.ocr_service = None


app = FastAPI(lifespan=lifespan)


def get_ocr_service(request: Request) -> PaddleXOCRService:
    return request.app.state.ocr_service


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


@app.post("/ocr/predict")
async def run_ocr(
    payload: OCRRequest,
    ocr: PaddleXOCRService = Depends(get_ocr_service),
    client: httpx.AsyncClient = Depends(get_http_client),
):
    # 1. Download file asynchronously
    try:
        response = await client.get(str(payload.image_url))
        response.raise_for_status()
        file_bytes = response.content
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch file: HTTP {e.response.status_code}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Network error while downloading file: {str(e)}",
        )

    # 2. Convert and run inference in background threadpool
    try:
        extracted_texts = await run_in_threadpool(ocr.predict_from_bytes, file_bytes)
        return {
            "text": extracted_texts,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}",
        )


async def process_ocr_task(
    payload: AsyncOCRRequest,
    ocr: PaddleXOCRService,
    client: httpx.AsyncClient,
):
    callback_headers = {}
    if payload.secret_token:
        callback_headers["X-Webhook-Secret"] = payload.secret_token

    try:
        logging.info(f"Starting async OCR processing for upload ID {payload.upload_id}")
        res = await client.get(str(payload.image_url))
        res.raise_for_status()
        file_bytes = res.content

        extracted_texts = await run_in_threadpool(ocr.predict_from_bytes, file_bytes)

        callback_payload = {
            "upload_id": payload.upload_id,
            "status": "completed",
            "text": extracted_texts,
            "error": None,
        }
        logging.info(f"OCR successful for upload ID {payload.upload_id}, posting callback to {payload.callback_url}")
        cb_res = await client.post(str(payload.callback_url), json=callback_payload, headers=callback_headers)
        cb_res.raise_for_status()

    except Exception as e:
        error_msg = str(e)
        logging.error(f"OCR processing failed for upload ID {payload.upload_id}: {error_msg}")
        callback_payload = {
            "upload_id": payload.upload_id,
            "status": "failed",
            "text": [],
            "error": error_msg,
        }
        try:
            await client.post(str(payload.callback_url), json=callback_payload, headers=callback_headers)
        except Exception as cb_err:
            logging.error(f"Failed to post error callback for upload ID {payload.upload_id}: {str(cb_err)}")


@app.post("/ocr/process", status_code=status.HTTP_202_ACCEPTED)
async def process_ocr(
    payload: AsyncOCRRequest,
    background_tasks: BackgroundTasks,
    ocr: PaddleXOCRService = Depends(get_ocr_service),
    client: httpx.AsyncClient = Depends(get_http_client),
):
    background_tasks.add_task(process_ocr_task, payload, ocr, client)
    return {
        "status": "queued",
        "upload_id": payload.upload_id,
        "message": "OCR process has been queued successfully.",
    }


if __name__ == "__main__":

    # host="0.0.0.0" is required inside Docker
    app.run(port=5000)