<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sensor;

class SensorsSeeder extends Seeder
{
    public function run(): void
    {
        $sensors = [
            [ // 1 Presencia (boolean)
                'key' => 'sensor-presencia',
                'name' => 'Sensor de Presencia',
                'status' => true,
                'type_data' => 'presencia',
                'min_value' => null,
                'max_value' => null,
            ],
            [ // 2 Temperatura
                'key' => 'sensor-temperatura',
                'name' => 'Sensor de Temperatura',
                'status' => true,
                'type_data' => 'temperatura',
                'min_value' => -10,
                'max_value' => 60,
            ],
            [ // 3 Gas (ppm)
                'key' => 'sensor-gas',
                'name' => 'Sensor de Gas',
                'status' => true,
                'type_data' => 'gas',
                'min_value' => 0,
                'max_value' => 1000,
            ],
            [ // 4 Peso HX711
                'key' => 'peso-hx711',
                'name' => 'Sensor de Peso',
                'status' => true,
                'type_data' => 'peso',
                'min_value' => 1,
                'max_value' => 50000,
            ],
            [ // 5 Puerta Control (grados)
                'key' => 'puerta-control',
                'name' => 'Sensor de Puerta',
                'status' => true,
                'type_data' => 'puerta',
                'min_value' => 90,
                'max_value' => 90,
            ],
            [ // 6 RFID UID
                'key' => 'rfid-uid',
                'name' => 'Sensor RFID UID',
                'status' => true,
                'type_data' => 'rfid',
                'min_value' => null,
                'max_value' => null,
            ],
        ];

        foreach ($sensors as $s) {
            Sensor::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}
