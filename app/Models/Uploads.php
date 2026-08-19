<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class Uploads extends Model
{

    protected $table = 'uploads';
    protected $fillable = [
        'uploader_id',
        'file_name',
        'file_url',
        'file_size',
        'mime_type',
        'status',
    ];

}
