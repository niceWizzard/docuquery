<?php

namespace App\Jobs;

use App\Enums\UploadStatus;
use App\Models\UploadChunk;
use App\Models\Uploads;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Pgvector\Vector;

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
    public function handle(): void
    {
        try {
            $this->upload['status'] = UploadStatus::PROCESSING->value;
            $this->upload->save();
            $fileUrl = config('services.bucket.base_url') . '/' . $this->upload['file_url'];
            $apiUrl = config('services.api.ocr_url') . '/ocr/predict';
            $response = Http::post(
                $apiUrl,
                [
                    'image_url' => $fileUrl,
                ]
            );
            if(!$response->successful()) {
                throw new \Exception("Unable to process upload.");
            }
            $processedTexts = is_array($response->json('text')) ? $response->json('text') : [];
            $embeddingUrl = config('services.api.embedding_url');
            $page = 1;
            DB::transaction(function () use ($processedTexts, $embeddingUrl, $page) {
                foreach ($processedTexts as $text) {

                    $embeddingResult = Http::post($embeddingUrl, [
                        'input' => $text,
                        'model' => config('services.api.embedding_model'),
                        'dimensions' => 1024,
                    ])->json('embeddings')[0];
                    UploadChunk::create([
                        'upload_id' => $this->upload->id,
                        'text' => $text,
                        'page' => $page,
                        'embedding' => new Vector($embeddingResult),
                    ]);
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
