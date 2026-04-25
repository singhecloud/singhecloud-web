<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BaniStreamKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'gurdwara_sahib',
        'user_id',
    ];

    protected $casts = [
        'gurdwara_sahib' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}