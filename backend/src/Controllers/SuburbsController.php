<?php

declare(strict_types=1);

namespace Fastway\Controllers;

use Fastway\Http\Request;
use Fastway\Http\Response;
use Fastway\Services\FastwayApiClient;

class SuburbsController
{
    public function __construct(
        private readonly Request  $request,
        private readonly Response $response
    ) {}

    public function search(): void
    {
        $term = trim((string) $this->request->query('term', ''));

        if (strlen($term) < 2 || !preg_match('/^[a-zA-Z0-9\s]{2,50}$/', $term)) {
            $this->response->success(['suburbs' => []]);
            return;
        }

        try {
            $raw = (new FastwayApiClient())->listSuburbs($term);
        } catch (\RuntimeException $e) {
            error_log('[Suburbs] ' . $e->getMessage());
            $this->response->success(['suburbs' => []]);
            return;
        }

        $this->response->success(['suburbs' => array_slice($raw['result'] ?? [], 0, 10)]);
    }
}
