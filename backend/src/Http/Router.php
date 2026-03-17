<?php

declare(strict_types=1);

namespace Fastway\Http;

class Router
{
    private array    $routes = [];
    private Request  $request;
    private Response $response;

    public function __construct(Request $request, Response $response)
    {
        $this->request  = $request;
        $this->response = $response;
    }

    public function addRoute(string $method, string $path, string $controller, string $action): void
    {
        $this->routes[] = compact('method', 'path', 'controller', 'action');
    }

    public function dispatch(): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] === $this->request->method && $route['path'] === $this->request->uri) {
                $controller = new $route['controller']($this->request, $this->response);
                $controller->{$route['action']}();
                return;
            }
        }

        $this->response->error('Route not found', 404);
    }
}
