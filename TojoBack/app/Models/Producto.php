<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'producto_id';
    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
    ];

    public function stockAlmacenes()
    {
        return $this->hasMany(StockAlmacen::class, 'producto_id', 'producto_id');
    }

    public function plantillasGondolas()
    {
        return $this->hasMany(PlantillaGondola::class, 'producto_id', 'producto_id');
    }
}
