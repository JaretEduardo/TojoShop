<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockAlmacen extends Model
{
    protected $table = 'stock_almacen';
    protected $primaryKey = 'almacen_id';
    protected $fillable = [
        'sucursal_id',
        'producto_id',
        'cantidad',
    ];

    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_id', 'sucursal_id');
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id', 'producto_id');
    }
}
