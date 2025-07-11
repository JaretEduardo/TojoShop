<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sucursal extends Model
{
    protected $table = 'sucursales';
    protected $primaryKey = 'sucursal_id';
    protected $fillable = [
        'nombre',
        'direccion',
    ];
}
