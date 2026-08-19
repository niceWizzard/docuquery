<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessUpload;
use App\Models\Uploads;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use function Laravel\Prompts\error;
use function Pest\Laravel\json;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $data = Uploads::where('uploader_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($file) {
                return [
                    ...$file->getAttributes(),
                    'file_url' => Storage::disk('s3')->url($file->file_url),
                ];
            });
        return Inertia::render('Uploads/Index', [
            'uploadedFiles' => $data,
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file','mimes:png,jpg,pdf']
        ]);
        if($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('uploads', $filename, 's3');
                $upload = Uploads::create([
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'file_name' => $file->getClientOriginalName(),
                    'uploader_id' => $request->user()->id,
                    'file_url' => $path,
                ]);
                ProcessUpload::dispatch($upload);
            }
        }
        return redirect(route('uploads.index'));
    }

    public function destroy(Request $request, Uploads $upload) {
        if ($request->user()->id !== $upload->uploader_id) {
            throw new AuthorizationException("You are not allowed to delete this upload.");
        }

        // Delete from the 'public' disk where it was stored
        Storage::disk('s3')->delete($upload->file_url);

        $upload->delete();

        return back()->with('success', 'File deleted successfully.');
    }

}
