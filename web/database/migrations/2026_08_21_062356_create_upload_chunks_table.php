<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        Schema::create('upload_chunks', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('upload_id')->nullable(false)->constrained('uploads')->cascadeOnDelete();
            $table->text('text')->nullable(false);
            $table->integer('page')->nullable(false)->default(0);
            $table->vector('embedding', 1024)->nullable(false);

            $table->index('upload_id');
        });

        DB::statement('
            CREATE INDEX idx_upload_chunks_embedding
            ON upload_chunks
            USING hnsw (embedding vector_cosine_ops)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_chunks');
    }
};
