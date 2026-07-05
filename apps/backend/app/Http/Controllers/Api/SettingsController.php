<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->groupBy('group');

        $grouped = $settings->map(function ($items, $group) {
            return [
                'group' => $group,
                'settings' => SettingResource::collection($items),
            ];
        })->values();

        return response()->success($grouped);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['nullable', 'string'],
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::where('key', $setting['key'])->update([
                'value' => $setting['value'] ?? '',
            ]);
        }

        return response()->success(['message' => 'Settings updated successfully.']);
    }

    public function get(string $group): JsonResponse
    {
        $settings = Setting::where('group', $group)->get();

        return response()->success([
            'group' => $group,
            'settings' => SettingResource::collection($settings),
        ]);
    }
}
