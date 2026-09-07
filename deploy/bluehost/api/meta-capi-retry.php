<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

define('JOAO_CAPI_LIBRARY_ONLY', true);
require __DIR__ . '/lead.php';

try {
    load_server_env_file();
    $result = meta_capi_retry_outbox(20);
    fwrite(STDOUT, json_encode($result, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL);
    exit($result['dead'] > 0 ? 2 : 0);
} catch (Throwable $exception) {
    fwrite(STDERR, "Meta CAPI retry worker failed.\n");
    exit(1);
}
