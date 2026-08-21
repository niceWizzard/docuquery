<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class UploadChunk extends Model
{
    protected $fillable = [
        'upload_id',
        'text',
        'embedding',
        'page'
    ];
}
