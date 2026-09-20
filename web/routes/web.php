<?php

use App\Http\Controllers\OcrWebhookController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QueryController;
use App\Http\Controllers\UploadController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/api/webhooks/ocr', [OcrWebhookController::class, 'handle'])->name('webhooks.ocr');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(QueryController::class)->group(function () {
        Route::get('/dashboard', 'index')->name('dashboard');
        Route::post('/query', 'query')->name('query');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::prefix('uploads')
    ->name('uploads.')
    ->middleware('auth')
    ->controller(UploadController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{upload}', 'show')->name('show');
        Route::post('/', 'store')->name('store');
    Route::delete('/{upload}', 'destroy')->name('destroy');


});

require __DIR__.'/auth.php';
