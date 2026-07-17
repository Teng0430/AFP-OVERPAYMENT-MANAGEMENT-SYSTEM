<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RolesController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::orderBy('name')->get();

        return response()->success([
            'roles' => $roles,
        ]);
    }
}
