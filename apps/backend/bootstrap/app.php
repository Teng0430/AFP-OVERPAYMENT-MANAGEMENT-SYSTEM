<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON error envelope for unauthenticated API requests
        $exceptions->render(function (AuthenticationException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->error('Unauthenticated.', 'UNAUTHENTICATED', 401);
            }

            return null;
        });

        // Return JSON error envelope for validation errors on API routes
        $exceptions->render(function (ValidationException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->error($e->getMessage(), 'VALIDATION_ERROR', 422, $e->errors());
            }

            return null;
        });

        // Return JSON error envelope for 404s on API routes
        $exceptions->render(function (NotFoundHttpException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->error('Resource not found.', 'NOT_FOUND', 404);
            }

            return null;
        });

        // Return actionable JSON error for database connection failures on API routes
        $exceptions->render(function (QueryException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*') || $request->expectsJson()) {
                $message = 'A system error occurred. Please try again later.';
                $code = 'DATABASE_ERROR';

                if (str_contains($e->getMessage(), 'No connection could be made') || str_contains($e->getMessage(), 'Connection refused')) {
                    $message = 'The database server is not running. Please contact your system administrator.';
                    $code = 'DB_CONNECTION_REFUSED';
                }

                return response()->error($message, $code, 503);
            }

            return null;
        });
    })->create();
