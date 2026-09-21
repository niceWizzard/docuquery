<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessUpload;
use App\Models\Uploads;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;
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
                    'file_url' => route('uploads.show', $file->id),
                ];
            });
        return Inertia::render('Uploads/Index', [
            'uploadedFiles' => $data,
        ]);
    }

    public function show(Request $request, Uploads $upload)
    {
        if ($request->user()->id !== $upload->uploader_id) {
            abort(403, 'Unauthorized access to this file.');
        }

        return Storage::disk('s3')->response($upload->file_url);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files'   => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'mimes:png,jpg,pdf', 'max:10240'],
        ]);

        $uploadedPaths = [];

        try {
            DB::transaction(function () use ($request, &$uploadedPaths) {
                foreach ($request->file('files') as $file) {
                    // 1. Upload to S3
                    $path = $file->store('uploads', 's3');

                    if (!$path) {
                        throw new \RuntimeException("Unable to store file: " . $file->getClientOriginalName());
                    }

                    // Track uploaded file so we can delete it if later steps fail
                    $uploadedPaths[] = $path;

                    $upload = Uploads::create([
                        'file_size'   => $file->getSize(),
                        'mime_type'   => $file->getMimeType(),
                        'file_name'   => $file->getClientOriginalName(),
                        'uploader_id' => $request->user()->id,
                        'file_url'    => $path,
                    ]);

                    ProcessUpload::dispatch($upload)->afterCommit();
                }
            });
        } catch (Throwable $e) {
            if (!empty($uploadedPaths)) {
                Storage::disk('s3')->delete($uploadedPaths);
            }
            report($e);
            return Inertia::flash('error', 'File upload failed. Please try again.')
                ->back();
        }

        return to_route('uploads.index')->with('success', 'Files uploaded successfully.');
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
