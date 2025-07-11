<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantillaGondola extends Model
{
    protected $table = 'plantillas_gondolas';
    protected $primaryKey = 'plantilla_id';
    protected $fillable = [
        'sucursal_id',
        'nombre_gondola',
        'nombre_producto',
        'producto_id',
        'posicion_x',
        'posicion_y',
    ];


    /**
     * Relación: la plantilla de góndola pertenece a una sucursal.
     * Permite acceder a la sucursal asociada a esta plantilla.
     */
    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_id', 'sucursal_id');
    }


    /**
     * Relación: la plantilla de góndola pertenece a un producto.
     * Permite acceder al producto asociado a esta plantilla.
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }

    /**
     * Relación: la plantilla de góndola tiene muchos sensores.
     * Permite acceder a todos los sensores asociados a esta plantilla.
     */
    public function sensores()
    {
        return $this->hasMany(Sensor::class, 'gondola_id', 'plantilla_id');
    }
}
