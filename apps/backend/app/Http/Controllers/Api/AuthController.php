<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->success(['user' => $user, 'token' => $token], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = $request->input('email');
        Log::info('Login attempt', ['email' => $email]);

        $user = User::where('email', $email)->first();

        if (! $user) {
            Log::warning('Login failed: user not found', ['email' => $email]);

            return response()->error('User not found.', 'AUTHENTICATION_ERROR', 401);
        }

        if (! Hash::check($request->input('password'), $user->password)) {
            Log::warning('Login failed: incorrect password', ['email' => $email]);

            return response()->error('Incorrect password.', 'AUTHENTICATION_ERROR', 401);
        }

        if (! $user->is_active) {
            Log::warning('Login failed: account inactive', ['email' => $email]);

            return response()->error('Account inactive.', 'AUTHENTICATION_ERROR', 401);
        }

        Log::info('Login successful', ['email' => $email, 'user_id' => $user->id]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->success(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->success(['message' => 'Logged out successfully.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->success(['user' => new UserResource($user)]);
    }

    public function tokens(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()->orderBy('created_at', 'desc')->get(['id', 'name', 'created_at', 'last_used_at']);

        return response()->success(['tokens' => $tokens]);
    }

    public function revokeToken(Request $request, string $id): JsonResponse
    {
        $token = $request->user()->tokens()->find($id);

        if (! $token) {
            return response()->error('Token not found.', 'NOT_FOUND', 404);
        }

        $token->delete();

        return response()->success(['message' => 'Token revoked.']);
    }
}
