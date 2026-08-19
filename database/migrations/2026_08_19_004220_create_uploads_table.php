<?php

use App\Enums\UploadStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('uploads', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('uploader_id')->nullable(false);
            $table->string('file_name',64)->nullable(false);
            $table->string('file_url',256)->nullable(false);
            $table->string('mime_type',64)->nullable(false);
            $table->integer('file_size')->nullable(false)->default(0);
            $table->enum('status',array_column(UploadStatus::cases(), 'value'))->nullable(false)->default(UploadStatus::PENDING->value);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uploads');
    }
};
