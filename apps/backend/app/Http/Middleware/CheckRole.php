<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->error('Unauthenticated.', 'UNAUTHENTICATED', 401);
        }

        $allowedRoles = explode('|', $roles);

        if (! $user->hasRole($allowedRoles)) {
            return response()->error(
                'You do not have the required role to perform this action.',
                'FORBIDDEN',
                403,
            );
        }

        return $next($request);
    }
}
