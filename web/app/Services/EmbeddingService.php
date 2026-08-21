<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    protected string $url;
    protected string $model;
    protected int $dimensions;
    protected int $timeout;

    public function __construct()
    {
        $this->url = (string) config('services.api.embedding_url');
        $this->model = (string) config('services.api.embedding_model');
        $this->dimensions = 1024;
        $this->timeout = 120;
    }

    /**
     * Generate an embedding vector for a single text string.
     *
     * @param string $text
     * @return array<float>
     * @throws Exception
     */
    public function generate(string $text): array
    {
        Log::info("REQUESTING EMBEDDING!");

        $response = Http::timeout($this->timeout)->post($this->url, [
            'input' => $text,
            'model' => $this->model,
            'dimensions' => $this->dimensions,
        ]);

        if (!$response->successful()) {
            throw new Exception("Failed to generate embedding: " . $response->body());
        }

        $embeddings = $response->json('embeddings');

        if (empty($embeddings) || !isset($embeddings[0])) {
            throw new Exception("Invalid embedding response structure.");
        }

        return $embeddings[0];
    }
}
