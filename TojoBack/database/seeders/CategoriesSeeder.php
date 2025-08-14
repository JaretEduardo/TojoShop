<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categories;

class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $names = ['Electrónicos', 'Ropa', 'Accesorios', 'Computadoras', 'Audio', 'Gaming', 'Tablets'];
        foreach ($names as $name) {
            Categories::firstOrCreate(['name' => $name]);
        }
    }
}
