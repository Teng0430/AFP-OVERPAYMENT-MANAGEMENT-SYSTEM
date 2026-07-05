<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AlertsController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Alert::query();

        if ($request->has('is_read')) {
            $query->where('is_read', filter_var($request->input('is_read'), FILTER_VALIDATE_BOOLEAN));
        }

        $alerts = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return AlertResource::collection($alerts);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->success(new AlertResource($alert));
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
