<?php

namespace App\Providers;

use App\Http\Middleware\CheckRole;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\ResponseFactory;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerResponseMacros();
        $this->configureRateLimiting();
        $this->configureMiddlewareAliases();
    }

    /**
     * Register API response envelope macros.
     *
     * All API responses follow the consistent JSON envelope:
     * { success: bool, data: ..., error: ... }
     */
    private function registerResponseMacros(): void
    {
        /** @var ResponseFactory $factory */
        $factory = $this->app->make(ResponseFactory::class);

        // Success envelope: { success: true, data: ... }
        $factory->macro('success', function (mixed $data = null, int $status = 200, string $message = ''): JsonResponse {
            $payload = ['success' => true, 'data' => $data];

            if ($message !== '') {
                $payload['message'] = $message;
            }

            return response()->json($payload, $status);
        });

        // Error envelope: { success: false, error: { message, code, details? } }
        $factory->macro('error', function (string $message, string $code, int $status = 400, mixed $details = null): JsonResponse {
            $error = ['message' => $message, 'code' => $code];

            if ($details !== null) {
                $error['details'] = $details;
            }

            return response()->json(['success' => false, 'error' => $error], $status);
        });
    }

    /**
     * Configure rate limiting for authentication endpoints.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('auth', function (Request $request): Limit {
            return Limit::perMinute(60)->by($request->ip());
        });
    }

    /**
     * Register route middleware aliases.
     */
    private function configureMiddlewareAliases(): void
    {
        /** @var Router $router */
        $router = $this->app->make(Router::class);

        $router->aliasMiddleware('role', CheckRole::class);
    }
}
