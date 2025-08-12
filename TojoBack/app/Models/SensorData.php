<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    use HasFactory;

    protected $table = 'sensor_data';

    protected $fillable = [
        'sensor_key',
        'feed_key',
        'feed_id',
        'value',
        'received_at',
    ];

    protected $casts = [
        'feed_id' => 'integer',
        'received_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function sensor()
    {
        return $this->belongsTo(Sensor::class, 'sensor_key', 'key');
    }

    // Scope para filtrar por feed
    public function scopeFeed($query, string $feedKey)
    {
        return $query->where('feed_key', $feedKey);
    }

    // Scope para últimos n registros
    public function scopeRecent($query, int $limit = 50)
    {
        return $query->orderByDesc('id')->limit($limit);
    }
}
