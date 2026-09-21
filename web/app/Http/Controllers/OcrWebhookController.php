<?php

namespace App\Http\Controllers;

use App\Enums\UploadStatus;
use App\Jobs\EmbedUploadPage;
use App\Models\UploadChunk;
use App\Models\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class OcrWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
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

        $upload->update([
            'status' => UploadStatus::PROCESSING,
        ]);

        if ($validated['status'] === 'completed') {
            UploadChunk::where('upload_id', $upload->id)->delete();

            $batchId = (string) Str::uuid();
            Log::info("Starting embedding process of upload {$upload->id} batch id {$batchId}.");
            $jobs = collect($validated['text'] ?? [])
                ->filter(fn($text) => !empty(trim($text)))
                ->values()
                ->map(fn($text, $index) => new EmbedUploadPage($upload, $index + 1, $text, $batchId))
                ->all();

            Bus::batch($jobs)
                ->name("embed-upload-{$upload->id}")
                ->then(function () use ($upload, $batchId) {
                    DB::transaction(function () use ($upload, $batchId) {
                        UploadChunk::where('upload_id', $upload->id)
                            ->where('batch_id', '!=', $batchId)
                            ->delete();
                        $upload->update(['status' => UploadStatus::COMPLETED->value]);
                        Log::info("Finished embedding batch id {$batchId} for upload {$upload->id}.");
                    });
                })
                ->catch(function ($batch, Throwable $e) use ($upload, $batchId) {
                    UploadChunk::where('upload_id', $upload->id)
                        ->where('batch_id', $batchId)
                        ->delete();
                    $upload->update(['status' => UploadStatus::FAILED->value]);
                    Log::error("Embedding batch {$batchId} process failed for upload: {$upload->id} - {$e->getMessage()} ");
                })
                ->dispatch();
        } else {
            Log::error("OCR processing reported failure for upload ID {$upload->id}: " . ($validated['error'] ?? 'Unknown error'));
            $upload->update([
                'status' => UploadStatus::FAILED->value,
            ]);
        }



        return response()->json(['message' => 'Webhook received error notification']);
    }
}
