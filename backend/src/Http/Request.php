<?php

declare(strict_types=1);

namespace Fastway\Http;

class Request
{
    public readonly string $method;
    public readonly string $uri;
    public readonly array  $query;
    public readonly array  $headers;
    public readonly string $ip;

    public function __construct()
    {
        $this->method  = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $this->uri     = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
        $this->query   = $_GET;
        $this->headers = getallheaders() ?: [];
        $this->ip      = $this->resolveIp();
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return isset($this->query[$key]) ? $this->query[$key] : $default;
    }

    private function resolveIp(): string
    {
        return $_SERVER['HTTP_X_FORWARDED_FOR']
            ?? $_SERVER['REMOTE_ADDR']
            ?? '0.0.0.0';
    }
}
