<?php
declare(strict_types=1);
define('JOAO_CAPI_LIBRARY_ONLY', true);
require __DIR__ . '/../deploy/bluehost/api/lead.php';
$base = getenv('TMPDIR');
if (!$base || !is_dir($base)) throw new RuntimeException('Private scratch directory required.');
$root = $base . '/joao-identity-lock-test-' . bin2hex(random_bytes(6));
mkdir($root, 0700);
putenv('GHL_ENV_FILE=' . $root . '/private.env');
putenv('LEAD_RATE_LIMIT_SALT=' . str_repeat('local-only-', 4));
$_SERVER['DOCUMENT_ROOT'] = __DIR__;
$lead = ['email' => 'owned@example.invalid', 'phone' => '+15125550100'];
$count = 0;
try {
    $locks = attribution_identity_locks($lead);
    if (count($locks) !== 2) throw new RuntimeException('Expected both identity locks.');
    $count++;
    try { attribution_identity_locks($lead); throw new LogicException('Concurrent identity was not blocked.'); }
    catch (RuntimeException $e) { if ($e->getMessage() !== 'Identity submission is busy.') throw $e; $count++; }
    foreach ($locks as $handle) fclose($handle);
    $locks = attribution_identity_locks($lead);
    foreach ($locks as $handle) fclose($handle);
    $count++;
    foreach (glob($root . '/lead-identity-locks/*.lock') as $file) {
        if ((fileperms($file) & 0777) !== 0600 || !preg_match('/^[a-f0-9]{64}\.lock$/D', basename($file))) throw new RuntimeException('Unsafe lock metadata.');
        $count++;
    }
    if ((fileperms($root . '/lead-identity-locks') & 0777) !== 0700) throw new RuntimeException('Unsafe directory mode.');
    $count++;
    echo json_encode(['passed' => $count, 'realProviderRequests' => 0]) . "\n";
} finally {
    foreach (glob($root . '/lead-identity-locks/*.lock') ?: [] as $file) unlink($file);
    @rmdir($root . '/lead-identity-locks');
    @rmdir($root);
}
