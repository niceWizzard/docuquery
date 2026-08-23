<?php

namespace App\Http\Controllers;

use App\Enums\UploadStatus;
use App\Models\UploadChunk;
use App\Models\Uploads;
use App\Services\EmbeddingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Pgvector\Laravel\Vector;
use Throwable;

class OcrWebhookController extends Controller
{
    public function handle(Request $request, EmbeddingService $embeddingService): JsonResponse
    {
        $secret = config('services.api.webhook_secret');
        if ($secret && $request->header('X-Webhook-Secret') !== $secret) {
            return response()->json(['message' => 'Unauthorized webhook secret'], 401);
        }

        $validated = $request->validate([
            'upload_id' => ['required', 'integer'],
            'status' => ['required', 'string', 'in:completed,failed'],
            'text' => ['nullable', 'array'],
            'text.*' => ['nullable', 'string'],
            'error' => ['nullable', 'string'],
        ]);

        $upload = Uploads::find($validated['upload_id']);
        if (!$upload) {
            return response()->json(['message' => "Upload ID {$validated['upload_id']} not found"], 404);
        }

        if ($validated['status'] === 'completed') {
            try {
                $processedTexts = $validated['text'] ?? [];
                $page = 1;

                DB::transaction(function () use ($upload, $processedTexts, $embeddingService, &$page) {
                    UploadChunk::where('upload_id', $upload->id)->delete();

                    foreach ($processedTexts as $pageText) {
                        if (empty(trim($pageText))) {
                            $page++;
                            continue;
                        }

                        $chunks = $embeddingService->chunkText($pageText, 500, 100);

                        foreach ($chunks as $chunk) {
                            $embeddingResult = $embeddingService->generate($chunk);
                            UploadChunk::create([
                                'upload_id' => $upload->id,
                                'text' => $chunk,
                                'page' => $page,
                                'embedding' => new Vector($embeddingResult),
                            ]);
                        }

                        $page++;
                    }
                });

                $upload->update([
                    'status' => UploadStatus::COMPLETED->value,
                ]);

                Log::info("OCR webhook completed successfully for upload ID {$upload->id}");
                return response()->json(['message' => 'Webhook processed successfully']);
            } catch (Throwable $e) {
                Log::error("Failed to process OCR completion webhook for upload ID {$upload->id}: {$e->getMessage()}");
                $upload->update([
                    'status' => UploadStatus::FAILED->value,
                ]);
                return response()->json(['message' => 'Failed to process OCR text embeddings', 'error' => $e->getMessage()], 500);
            }
        }

        // Status is 'failed'
        Log::error("OCR processing reported failure for upload ID {$upload->id}: " . ($validated['error'] ?? 'Unknown error'));
        $upload->update([
            'status' => UploadStatus::FAILED->value,
        ]);

        return response()->json(['message' => 'Webhook received error notification']);
    }
}
