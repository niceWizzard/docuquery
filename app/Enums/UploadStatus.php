<?php

namespace App\Enums;

enum UploadStatus: string
{
    case PENDING = "pending";
    case PROCESSING = "processing";
    case COMPLETED = "completed";
    case CANCELED = "cancelled";
    case FAILED = "failed";
}
