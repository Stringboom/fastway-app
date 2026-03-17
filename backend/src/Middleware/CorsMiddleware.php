<?php

declare(strict_types=1);

namespace Fastway\Middleware;

use Fastway\Http\Request;
use Fastway\Http\Response;

class CorsMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        $origin = getenv('ALLOWED_ORIGIN') ?: '*';

        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

        if ($request->method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
