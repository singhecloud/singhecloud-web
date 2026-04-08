<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurrentSpeechToken extends Model
{
    protected $fillable = [
        'user_id',
        'shabad_id',
        'line_id',
        'final_token',
        'partial_token',
        'corrected_token',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}