<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalAccessToken extends Model
{
    protected $table = 'personal_access_tokens';
    protected $fillable = [
        'tokenable_type', 'tokenable_id', 'name', 'token', 'abilities', 'last_used_at', 'expires_at',
    ];
    public $timestamps = false;

    /**
     * Relación polimórfica: el token puede pertenecer a cualquier modelo (usualmente User).
     * Permite acceder al modelo propietario del token (por ejemplo, un usuario autenticado).
     */
    public function tokenable()
    {
        return $this->morphTo();
    }
}
