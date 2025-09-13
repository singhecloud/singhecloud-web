<?php

return [
    'binary_path' => env('PUPPETEER_EXECUTABLE_PATH', null),

    'options' => [
        'no-sandbox' => true, // add if you’re on Ubuntu 23.10+ or Docker
        // 'disable-setuid-sandbox' => true,
    ],
];
