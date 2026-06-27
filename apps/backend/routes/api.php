<?php

use App\Http\Controllers\Api\HealthCheckController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned the "api" middleware group.
|
*/

// Public routes (no authentication required)
Route::get('/health', HealthCheckController::class);

// Protected routes (require Sanctum token authentication)
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', function (Request $request): JsonResponse {
        /** @var User $user */
        $user = $request->user();

        return response()->success(['user' => $user]);
    });
});
