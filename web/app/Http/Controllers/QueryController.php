<?php

namespace App\Http\Controllers;

use App\Models\UploadChunk;
use App\Models\Uploads;
use App\Services\EmbeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Pgvector\Laravel\Distance;

class QueryController extends Controller
{
    public function index() {
        return Inertia::render('Query/Index');
    }

    public function query(Request $request, EmbeddingService $embeddingService)
    {
        $request->validate([
            'query' => ['required', 'string', 'min:3', 'max:1024'],
        ]);
        $embeddingResult = $embeddingService->generate($request->input('query'));
        $relevant = UploadChunk::with('upload')
            ->nearestNeighbors('embedding', $embeddingResult, Distance::Cosine)
            ->take(5)
            ->get();

        $contextBlocks = $relevant->map(function ($chunk, $index) {
            $sourceNum = $index + 1;
            return "[File ID - {$chunk->upload->id} - Source {$sourceNum} - Page {$chunk->page}]:\n{$chunk->text}";
        })->implode("\n\n---\n\n");

        $userQuery = $request->input("query");

        $systemInstruction = <<<INSTRUCTION
        You are a factual assistant. Answer the user's question using ONLY the provided Document Context below.
        - Do NOT assume or extrapolate facts not present in the context.
        - If the context does not contain enough information, set "message" to "I cannot find the answer in the provided documents." and "fileId" to null.
        - In "message", include the answer and a short explanation of how the top matching document fits the query.
        - You must respond with a raw JSON object matching this exact schema:
        {
          "message": "Your answer and explanation here. Make it under 100 tokens.",
          "fileId": 123
        }
        INSTRUCTION;

        $response = Http::withToken(config('services.api.llm_key'))
            ->post(config('services.api.llm_url'), [
                'model' => config('services.api.llm_model'),
                'temperature' => 0.2,
                'response_format' => ['type' => 'json_object'], // Forces OpenAI / compatible APIs to return valid JSON
                'messages' => [
                    ['role' => 'system', 'content' => $systemInstruction],
                    ['role' => 'user', 'content' => "Context:\n{$contextBlocks}\n\nQuestion: {$userQuery}"],
                ],
            ])->json();

        $rawContent = $response['choices'][0]['message']['content'] ?? null;
        $parsedData = json_decode($rawContent, true);
        $fileId = $parsedData['fileId'] ?? ($relevant->first()->upload_id ?? null);
        $upload = Uploads::find($fileId);
        if ($upload != null) {
            $fileData = [
                ...$upload->getAttributes(),
                'file_url' => route('uploads.show', ['upload' => $upload]),
            ];
        }
        $result = [
            'message' => $parsedData['message'] ?? 'No answer generated.',
            'file' => $fileData,
        ];

        return back()->with('result', [
            'queryResult' => $result,
        ]);
    }

}
