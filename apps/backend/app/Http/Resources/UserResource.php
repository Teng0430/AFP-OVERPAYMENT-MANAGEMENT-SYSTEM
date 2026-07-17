<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_image_url' => $this->profile_image_url ?? null,
            'role_id' => $this->role_id,
            'role' => $this->whenLoaded('role', fn () => $this->role),
            'department' => $this->department,
            'is_active' => (bool) $this->is_active,
            'two_factor_enabled' => (bool) $this->two_factor_enabled,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
