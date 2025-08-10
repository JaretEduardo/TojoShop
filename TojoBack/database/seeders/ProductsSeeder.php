<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Products;
use App\Models\Categories;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = Categories::query()->pluck('id')->all();
        Products::factory()->count(50)->create()->each(function ($product) use ($categoryIds) {
            if (!empty($categoryIds)) {
                $product->category_id = $categoryIds[array_rand($categoryIds)];
                $product->save();
            }
        });
    }
}
