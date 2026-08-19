<?php

namespace App\Http\Controllers;

use App\Models\Uploads;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadController extends Controller
{
    public function index(Request $request) 
    {
        $user = $request->user();
        $data = Uploads::where('uploader_id', $user->id)
            ->latest()
            ->get();
        return Inertia::render('Uploads/Index', [
            'data' => $data,
        ]);
    }
}
