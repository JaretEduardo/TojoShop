<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Keeping pluralized class name but binding to conventional 'products' table.
     */
    protected $table = 'products';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'price',
    'stock',
    'category_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    /**
     * Scope a query to search by name or description.
     */
    public function scopeSearch($query, string $term)
    {
        $t = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $term) . '%';
        return $query->where(function ($q) use ($t, $term) {
            $q->where('name', 'like', $t)
              ->orWhere('description', 'like', $t);
            // If the term is numeric, also match by exact ID
            if (ctype_digit(trim($term))) {
                $q->orWhere('id', (int) trim($term));
            }
        });
    }

    /**
     * Scope to filter by category id.
     */
    public function scopeCategory($query, $categoryId)
    {
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }
        return $query;
    }

    /**
     * Category relationship.
     */
    public function category()
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }
}
