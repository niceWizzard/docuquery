<?php

use Illuminate\Support\Env;

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */
    'api' => [
        'ocr_url' => Env::getOrFail('OCR_API_ENDPOINT'),
        'embedding_url' => Env::getOrFail('CREATE_EMBEDDING_URL'),
        'embedding_model' => Env::getOrFail('CREATE_EMBEDDING_MODEL'),
        'llm_key'=>Env::getOrFail("LLM_API_KEY"),
        'llm_model'=> Env::getOrFail("LLM_MODEL"),
        'llm_url' => Env::getOrFail("LLM_URL"),
        'webhook_url' => Env::getOrFail("OCR_WEBHOOK_URL"),
        'webhook_secret' => Env::get("OCR_WEBHOOK_SECRET"),
    ],
    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
