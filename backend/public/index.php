<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use Fastway\Http\Router;
use Fastway\Http\Request;
use Fastway\Http\Response;
use Fastway\Middleware\CorsMiddleware;
use Fastway\Middleware\RateLimitMiddleware;

$request  = new Request();
$response = new Response();

(new CorsMiddleware())->handle($request, $response);

$rateLimiter = new RateLimitMiddleware();
if (!$rateLimiter->handle($request, $response)) {
    exit;
}

$router = new Router($request, $response);
$router->addRoute('GET', '/api/health',  \Fastway\Controllers\HealthController::class,  'index');
$router->addRoute('GET', '/api/track',   \Fastway\Controllers\TrackController::class,   'track');
$router->addRoute('GET', '/api/quote',   \Fastway\Controllers\QuoteController::class,   'quote');
$router->addRoute('GET', '/api/suburbs', \Fastway\Controllers\SuburbsController::class, 'search');
$router->dispatch();
