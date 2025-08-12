<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;

class SensorController extends Controller
{
    public function GetLastData(Request $request)
    {
        // Lógica para manejar la solicitud de listado de sensores
    }

    public function CreateData(Request $request)
    {
        // Lógica para manejar la solicitud de creación de datos de sensores
    }

    public function UpdateDataPoint(Request $request)
    {
        // Lógica para manejar la solicitud de actualización de datos de sensores
    }

    public function DeleteDataPoint(Request $request)
    {
        // Lógica para manejar la solicitud de eliminación de datos de sensores
    }

    public function GetFeedData(Request $request, $feedKey)
    {
        // Lógica para manejar la solicitud de datos por feed
    }

    public function ChartFeedData(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de datos por sensor
    }

    public function AllFeeds(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de datos de un sensor específico
    }

    // Agrega un nuevo sensor
    public function CreateFeed(Request $request)
    {
        // Aceptamos tanto 'status' boolean directo como 'state' string ('activo'/'inactivo') para flexibilidad
        $data = $request->all();

        // Normalizar si viene 'state'
        if (isset($data['state']) && !isset($data['status'])) {
            $state = strtolower($data['state']);
            $data['status'] = $state === 'activo' || $state === '1' || $state === 'true';
        }

        // Validar campos
        $validated = validator($data, [
            'key' => 'required|string|max:255|unique:sensors,key',
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
            'type_data' => 'required|string|max:255',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
        ])->validate();

        // Guardar
        $sensor = Sensor::create($validated);

        return response()->json([
            'statusCode' => 201,
            'message' => 'Sensor creado correctamente',
            'data' => $sensor,
        ], 201);
    }

    public function GetFeed(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de eliminación de un feed específico
    }

    public function UpdateFeed(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de actualización de un feed específico
    }

    public function DeleteFeed(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de eliminación de un feed específico
    }
}
