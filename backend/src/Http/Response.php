<?php

declare(strict_types=1);

namespace Fastway\Http;

class Response
{
    private int $statusCode = 200;

    public function json(array $data, int $status = 200): void
    {
        $this->statusCode = $status;
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public function error(string $message, int $status = 400, ?string $detail = null): void
    {
        $payload = ['success' => false, 'error' => $message];
        if ($detail !== null) {
            $payload['detail'] = $detail;
        }
        $this->json($payload, $status);
    }

    public function success(array $data): void
    {
        $this->json(['success' => true, 'data' => $data]);
    }
}
