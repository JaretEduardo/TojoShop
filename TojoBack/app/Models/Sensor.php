<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    protected $table = 'sensores';
    protected $primaryKey = 'sensor_id';
    protected $fillable = [
        'tipo_sensor',
        'posicion_x',
        'posicion_y',
        'gondola_id',
    ];

    public function plantillaGondola()
    {
        return $this->belongsTo(PlantillaGondola::class, 'gondola_id', 'plantilla_id');
    }
}
