<?php

declare(strict_types=1);

namespace Fastway\Middleware;

use Fastway\Http\Request;
use Fastway\Http\Response;

class RateLimitMiddleware
{
    private const MAX_REQUESTS   = 30;
    private const WINDOW_SECONDS = 60;

    private string $storageDir;

    public function __construct()
    {
        $this->storageDir = sys_get_temp_dir() . '/fastway_rl/';
        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0750, true);
        }
    }

    public function handle(Request $request, Response $response): bool
    {
        $ip   = preg_replace('/[^a-zA-Z0-9._:-]/', '_', $request->ip);
        $file = $this->storageDir . md5($ip) . '.json';
        $data = ['count' => 0, 'window_start' => time()];

        if (file_exists($file)) {
            $stored = json_decode(file_get_contents($file), true);
            if ($stored && (time() - $stored['window_start']) < self::WINDOW_SECONDS) {
                $data = $stored;
            }
        }

        $data['count']++;
        file_put_contents($file, json_encode($data), LOCK_EX);

        header('X-RateLimit-Limit: '     . self::MAX_REQUESTS);
        header('X-RateLimit-Remaining: ' . max(0, self::MAX_REQUESTS - $data['count']));

        if ($data['count'] > self::MAX_REQUESTS) {
            $response->error('Too many requests. Please wait before trying again.', 429);
            return false;
        }

        return true;
    }
}
