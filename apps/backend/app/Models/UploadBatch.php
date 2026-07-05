<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UploadBatch extends Model
{
    protected $fillable = [
        'file_name',
        'file_type',
        'file_size',
        'total_rows',
        'success_count',
        'error_count',
        'duplicate_count',
        'errors',
        'column_mapping',
        'status',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'errors' => 'array',
            'column_mapping' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * @return HasMany<Pensioner, $this>
     */
    public function pensioners(): HasMany
    {
        return $this->hasMany(Pensioner::class);
    }
}
