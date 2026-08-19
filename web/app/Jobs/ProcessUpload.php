<?php

namespace App\Jobs;

use App\Enums\UploadStatus;
use App\Models\Uploads;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessUpload implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Uploads $upload,
    )
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        sleep(2);
        $this->upload['status'] = UploadStatus::PROCESSING->value;
        $this->upload->save();

        sleep(10);
        $this->upload['status'] = UploadStatus::COMPLETED->value;
        $this->upload->save();
    }
}
