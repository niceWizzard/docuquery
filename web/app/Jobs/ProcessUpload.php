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

class ProcessUpload implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Uploads $upload,
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(EmbeddingService $embeddingService): void
    {
        try {
            $this->upload['status'] = UploadStatus::PROCESSING->value;
            $this->upload->save();
            $fileUrl = config('services.bucket.base_url') . '/' . $this->upload['file_url'];
            $apiUrl = config('services.api.ocr_url') . '/ocr/predict';
            Log::info("REQUESTING OCR!");
            $response = Http::timeout(120)->post(
                $apiUrl,
                [
                    'image_url' => $fileUrl,
                ]
            );
            if(!$response->successful()) {
                throw new \Exception("Unable to process upload.");
            }
            $processedTexts = is_array($response->json('text')) ? $response->json('text') : [];
            $page = 1;
            DB::transaction(function () use ($processedTexts, $embeddingService, &$page) {
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
            $this->upload['status'] = UploadStatus::COMPLETED->value;
            $this->upload->save();
        }catch (\Exception $exception){
            Log::error($exception->getMessage());
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
        }
    }
}
