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

    /**
     * Split text into word-based chunks of approximately $chunkSize characters with $chunkOverlap overlap.
     *
     * @param string $text
     * @param int $chunkSize
     * @param int $chunkOverlap
     * @return array<string>
     */
    public function chunkText(string $text, int $chunkSize = 500, int $chunkOverlap = 100): array
    {
        $text = trim($text);
        if (empty($text)) {
            return [];
        }

        if (mb_strlen($text) <= $chunkSize) {
            return [$text];
        }

        $words = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
        if (empty($words)) {
            return [];
        }

        $chunks = [];
        $currentWords = [];
        $currentLength = 0;
        $i = 0;
        $totalWords = count($words);

        while ($i < $totalWords) {
            $word = $words[$i];
            $wordLength = mb_strlen($word);
            $space = empty($currentWords) ? 0 : 1;

            if ($currentLength + $space + $wordLength <= $chunkSize || empty($currentWords)) {
                $currentWords[] = $word;
                $currentLength += $space + $wordLength;
                $i++;
            } else {
                $chunks[] = implode(' ', $currentWords);

                $overlapLength = 0;
                $overlapWords = [];
                for ($j = count($currentWords) - 1; $j >= 0; $j--) {
                    $wLen = mb_strlen($currentWords[$j]);
                    $spaceLen = empty($overlapWords) ? 0 : 1;
                    if ($overlapLength + $spaceLen + $wLen <= $chunkOverlap) {
                        array_unshift($overlapWords, $currentWords[$j]);
                        $overlapLength += $spaceLen + $wLen;
                    } else {
                        break;
                    }
                }

                if (count($overlapWords) >= count($currentWords)) {
                    array_shift($overlapWords);
                    $overlapLength = mb_strlen(implode(' ', $overlapWords));
                }

                $currentWords = $overlapWords;
                $currentLength = $overlapLength;
            }
        }

        if (!empty($currentWords)) {
            $chunks[] = implode(' ', $currentWords);
        }

        return $chunks;
    }
}
