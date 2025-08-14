<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class EmployeeUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'empleado@gmail.com'],
            [
                'name' => 'Empleado Demo',
                'password' => Hash::make('12345678'),
                'role' => 'empleado',
            ]
        );
    }
}
