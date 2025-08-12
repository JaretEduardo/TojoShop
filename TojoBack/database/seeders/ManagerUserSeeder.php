<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ManagerUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'encargado@gmail.com'],
            [
                'name' => 'Encargado Demo',
                'password' => Hash::make('12345678'),
                'role' => 'encargado',
            ]
        );
    }
}
