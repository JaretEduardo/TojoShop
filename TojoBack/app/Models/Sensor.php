<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $table = 'sensors';

    protected $fillable = [
        'key',
        'name',
        'status',
        'type_data',
        'min_value',
        'max_value',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'status' => 'boolean',
    ];

    // Usamos la columna 'key' para relacionar con sensor_data
    public function data()
    {
        return $this->hasMany(SensorData::class, 'sensor_key', 'key');
    }

    // Scope para activos
    public function scopeActivos($query)
    {
        return $query->where('status', true);
    }
}
