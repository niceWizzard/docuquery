<?php

namespace App\Jobs;

use App\Enums\UploadStatus;
use App\Models\UploadChunk;
use App\Models\Uploads;
use App\Services\EmbeddingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Pgvector\Laravel\Vector;
use Throwable;

class ProcessUpload implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public int $timeout = 180;

    public function __construct(
        public Uploads $upload,
    ) {}

    public function handle(EmbeddingService $embeddingService): void
    {
        try {
            $this->upload->update([
                'status' => UploadStatus::PROCESSING->value,
            ]);

            $fileUrl = rtrim(config('services.bucket.base_url'), '/') . '/' . $this->upload->file_url;
            $apiUrl = rtrim(config('services.api.ocr_url'), '/') . '/ocr/predict';

            Log::info("Requesting OCR for upload ID {$this->upload->id} (Attempt {$this->attempts()}/{$this->tries})");

            $response = Http::timeout(120)->post($apiUrl, [
                'image_url' => $fileUrl,
            ]);

            if (!$response->successful()) {
                throw new \Exception("OCR API returned status {$response->status()}: " . $response->body());
            }

            $processedTexts = is_array($response->json('text')) ? $response->json('text') : [];
            $page = 1;

            DB::transaction(function () use ($processedTexts, $embeddingService, &$page) {
                // Clear any previous partial chunks from earlier attempts
                UploadChunk::where('upload_id', $this->upload->id)->delete();

                foreach ($processedTexts as $pageText) {
                    if (empty(trim($pageText))) {
                        $page++;
                        continue;
                    }

                    $chunks = $embeddingService->chunkText($pageText, 500, 100);

                    foreach ($chunks as $chunk) {
                        $embeddingResult = $embeddingService->generate($chunk);
                        UploadChunk::create([
                            'upload_id' => $this->upload->id,
                            'text' => $chunk,
                            'page' => $page,
                            'embedding' => new Vector($embeddingResult),
                        ]);
                    }

                    $page++;
                }
            });

            $this->upload->update([
                'status' => UploadStatus::COMPLETED->value,
            ]);

            Log::info("Successfully processed upload ID {$this->upload->id}");

        } catch (Throwable $e) {
            Log::warning("ProcessUpload attempt {$this->attempts()} failed for upload ID {$this->upload->id}: {$e->getMessage()}");

            // Re-throw so Laravel triggers retry or marks job as failed
            throw $e;
        }
    }

    public function failed(?Throwable $exception): void
    {
        Log::error("ProcessUpload permanently failed for upload ID {$this->upload->id}: " . ($exception?->getMessage() ?? 'Unknown error'));

        // Update database status to FAILED
        $this->upload->update([
            'status' => UploadStatus::FAILED->value,
        ]);
    }
}

