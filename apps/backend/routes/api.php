<?php

use App\Http\Controllers\Api\AlertsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\PensionerController;
use App\Http\Controllers\Api\RecoveryController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UsersController;
use Illuminate\Support\Facades\Route;

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::get('/health', HealthCheckController::class);

// Protected routes (require Sanctum token authentication)
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/tokens', [AuthController::class, 'tokens']);
    Route::delete('/tokens/{id}', [AuthController::class, 'revokeToken']);

    // Pensioners
    Route::apiResource('pensioners', PensionerController::class)->except(['create', 'edit']);
    Route::post('pensioners/bulk-delete', [PensionerController::class, 'bulkDelete']);
    Route::post('pensioners/bulk-update', [PensionerController::class, 'bulkUpdate']);

    // Dashboard
    Route::get('dashboard/kpis', [DashboardController::class, 'kpis']);
    Route::get('dashboard/charts', [DashboardController::class, 'charts']);

    // Upload
    Route::get('upload/batches', [UploadController::class, 'index']);
    Route::post('upload/preview', [UploadController::class, 'preview']);
    Route::post('upload/import', [UploadController::class, 'import']);
    Route::get('upload/batches/{id}', [UploadController::class, 'show']);

    // Recovery
    Route::get('recovery/ledger', [RecoveryController::class, 'ledger']);
    Route::post('recovery/installments', [RecoveryController::class, 'storeInstallment']);
    Route::post('recovery/collections', [RecoveryController::class, 'storeCollection']);

    // Search
    Route::get('search', [SearchController::class, 'search']);

    // Reports
    Route::get('reports', [ReportsController::class, 'index']);
    Route::get('reports/export', [ReportsController::class, 'export']);
    Route::get('reports/export-pdf', [ReportsController::class, 'exportPdf']);
    Route::get('reports/export-csv', [ReportsController::class, 'exportCsv']);

    // Alerts
    Route::get('alerts', [AlertsController::class, 'index']);
    Route::put('alerts/{id}/read', [AlertsController::class, 'markAsRead']);
    Route::put('alerts/read-all', [AlertsController::class, 'markAllAsRead']);
    Route::delete('alerts/{id}', [AlertsController::class, 'destroy']);

    // Users
    Route::apiResource('users', UsersController::class)->except(['create', 'edit']);

    // Settings
    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings', [SettingsController::class, 'update']);
    Route::get('settings/{group}', [SettingsController::class, 'get']);
});
