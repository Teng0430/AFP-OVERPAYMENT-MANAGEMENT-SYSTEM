<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Alert::query();

        if ($request->has('is_read')) {
            $query->where('is_read', filter_var($request->input('is_read'), FILTER_VALIDATE_BOOLEAN));
        }

        $alerts = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->success([
            'alerts' => AlertResource::collection($alerts),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'last_page' => $alerts->lastPage(),
                'per_page' => $alerts->perPage(),
                'total' => $alerts->total(),
                'from' => $alerts->firstItem(),
                'to' => $alerts->lastItem(),
            ],
        ]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->success(['alert' => new AlertResource($alert)]);
    }

    public function markAllAsRead(): JsonResponse
    {
        Alert::where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->success(['message' => 'All alerts marked as read.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->delete();

        return response()->success(['message' => 'Alert deleted successfully.']);
    }
}
