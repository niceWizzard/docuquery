<?php

namespace App\Enums;

enum UploadStatus: string
{
    case PENDING = "pending";
    case EXTRACTING = "extracting";
    case PROCESSING = "processing";
    case COMPLETED = "completed";
    case CANCELED = "cancelled";
    case FAILED = "failed";
}
