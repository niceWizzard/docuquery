<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pgvector\Laravel\HasNeighbors;
use Pgvector\Laravel\Vector;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class UploadChunk extends Model
{
    use HasNeighbors;
    protected $fillable = [
        'upload_id',
        'text',
        'embedding',
        'page'
    ];

    protected $casts = [
        'embedding' => Vector::class,
    ];


    public function upload(): BelongsTo
    {
        return $this->belongsTo(Uploads::class, 'upload_id');
    }

}
