<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    /**
     * Log an audit trail entry.
     *
     * @param  array<string, mixed>|null  $old_values
     * @param  array<string, mixed>|null  $new_values
     */
    public static function log(
        ?int $user_id,
        string $action,
        string $entity_type,
        ?int $entity_id = null,
        ?string $description = null,
        ?array $old_values = null,
        ?array $new_values = null,
        ?string $ip_address = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user_id,
            'action' => $action,
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'description' => $description,
            'old_values' => $old_values,
            'new_values' => $new_values,
            'ip_address' => $ip_address,
        ]);
    }
}
