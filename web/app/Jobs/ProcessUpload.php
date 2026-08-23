<?php

namespace App\Jobs;

use App\Enums\UploadStatus;
use App\Models\Uploads;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

    public function handle(): void
    {
        try {
            $this->upload->update([
                'status' => UploadStatus::PROCESSING->value,
            ]);

            $fileUrl = rtrim(config('services.bucket.base_url'), '/') . '/' . $this->upload->file_url;
            $apiUrl = rtrim(config('services.api.ocr_url'), '/') . '/ocr/process';
            $callbackUrl = config('services.api.webhook_url');
            $secretToken = config('services.api.webhook_secret');

            Log::info("Dispatching async OCR process for upload ID {$this->upload->id} (Attempt {$this->attempts()}/{$this->tries})");

            $payload = [
                'upload_id' => $this->upload->id,
                'image_url' => $fileUrl,
                'callback_url' => $callbackUrl,
            ];

            if ($secretToken) {
                $payload['secret_token'] = $secretToken;
            }

            $response = Http::timeout(15)->post($apiUrl, $payload);

            if (!$response->successful() && $response->status() !== 202) {
                throw new \Exception("FastAPI OCR request failed with status {$response->status()}: " . $response->body());
            }

            Log::info("Successfully queued OCR process in FastAPI for upload ID {$this->upload->id}");
            Log::info("Payload: " . json_encode($payload));

        } catch (Throwable $e) {
            Log::warning("ProcessUpload attempt {$this->attempts()} failed for upload ID {$this->upload->id}: {$e->getMessage()}");

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

