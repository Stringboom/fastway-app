<?php

declare(strict_types=1);

namespace Fastway\Controllers;

use Fastway\Http\Request;
use Fastway\Http\Response;

class HealthController
{
    public function __construct(
        private readonly Request  $request,
        private readonly Response $response
    ) {}

    public function index(): void
    {
        $this->response->success([
            'status'    => 'ok',
            'timestamp' => date('c'),
            'version'   => '1.0.0',
        ]);
    }
}
