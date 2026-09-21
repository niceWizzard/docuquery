<?php

namespace App\Jobs;

use App\Models\UploadChunk;
use App\Models\Uploads;
use App\Services\EmbeddingService;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Pgvector\Vector;

class EmbedUploadPage implements ShouldQueue
{
    use Batchable, Queueable, SerializesModels;

    public function __construct(
        public Uploads $upload,
        public int $page,
        public string $pageText,
        public string $embedBatchId
    ) {}

    public function handle(EmbeddingService $embeddingService): void
    {
        if ($this->batch()?->cancelled()) {
            Log::warning("This batch <{$this->batchId}> was cancelled. ");
            return;
        }

        $chunks = $embeddingService->chunkText($this->pageText);
        if (empty($chunks)) {
            Log::warning("No chunks generated for page {$this->page} of Upload: {$this->upload->id}");
            return;
        }

        $records = [];
        foreach ($chunks as $chunk) {
            $vector = $embeddingService->generate($chunk);
            $records[] = [
                'upload_id'  => $this->upload->id,
                'text'       => $chunk,
                'page'       => $this->page,
                'embedding'  => new Vector($vector),
                'batch_id' => $this->embedBatchId
            ];
        }
        UploadChunk::insert($records);
        Log::info("Finished page {$this->page} of Upload: {$this->upload->id}");
    }
}
