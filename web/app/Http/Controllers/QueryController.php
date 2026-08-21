<?php

namespace App\Http\Controllers;

use App\Models\UploadChunk;
use App\Services\EmbeddingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Pgvector\Laravel\Distance;

class QueryController extends Controller
{
    public function index() {
        return Inertia::render('Query/Index');
    }

    public function query(Request $request, EmbeddingService $embeddingService) {
        $request->validate([
            'query' => ['required', 'string', 'min:3', 'max:1024'],
        ]);
        $embeddingResult = $embeddingService->generate($request->input('query'));
        $relevant = UploadChunk::with('upload')
            ->nearestNeighbors('embedding', $embeddingResult, Distance::Cosine)
            ->take(5)
            ->get();
    return back()->with('result', [
            'queryResult' => $relevant->map(function ($item) {
                return $item->upload->file_name;
            }),
        ]);
    }

}
