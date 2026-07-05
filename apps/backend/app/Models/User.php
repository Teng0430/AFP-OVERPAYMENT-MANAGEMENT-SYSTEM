<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Services\AuditService;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'department',
        'is_active',
        'two_factor_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'role_id' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * @param  string|string[]  $roles
     */
    public function hasRole(string|array $roles): bool
    {
        if ($this->role === null) {
            return false;
        }

        $roles = (array) $roles;

        return in_array($this->role->getAttribute('slug'), $roles, true);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role === null || empty($this->role->getAttribute('permissions'))) {
            return false;
        }

        return in_array($permission, $this->role->getAttribute('permissions'), true);
    }

    /**
     * @param  string[]  $permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->role === null || empty($this->role->getAttribute('permissions'))) {
            return false;
        }

        return ! empty(array_intersect($permissions, $this->role->getAttribute('permissions')));
    }

    /**
     * Log an audit trail entry for this user.
     *
     * @param  array<string, mixed>|null  $old_values
     * @param  array<string, mixed>|null  $new_values
     */
    public function logAudit(
        string $action,
        string $entity_type,
        ?int $entity_id = null,
        ?string $description = null,
        ?array $old_values = null,
        ?array $new_values = null,
        ?string $ip_address = null,
    ): AuditLog {
        return AuditService::log(
            user_id: $this->id,
            action: $action,
            entity_type: $entity_type,
            entity_id: $entity_id,
            description: $description,
            old_values: $old_values,
            new_values: $new_values,
            ip_address: $ip_address,
        );
    }
}
