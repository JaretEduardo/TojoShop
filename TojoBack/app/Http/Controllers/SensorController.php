<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\SensorData;

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

    public function AllFeeds(Request $request)
    {
        // Lista todos los sensores (encargado)
        $sensors = Sensor::all();
        return response()->json([
            'statusCode' => 200,
            'data' => $sensors,
        ]);
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
        // Lógica para manejar la solicitud de actualización de un sensor en específico
        $sensor = Sensor::where('key', $sensorKey)->first();

        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado',
            ], 404);
        }

        // Obtener datos y normalizar si viene 'state'
        $data = $request->all();
        
        if (isset($data['state']) && !isset($data['status'])) {
            $state = strtolower($data['state']);
            $data['status'] = $state === 'activo' || $state === '1' || $state === 'true';
        }

        // Validar campos (key no se puede cambiar)
        $validated = validator($data, [
            'name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|boolean',
            'type_data' => 'sometimes|required|string|max:255',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
        ])->validate();

        // Actualizar solo los campos validados
        $sensor->update($validated);

        return response()->json([
            'statusCode' => 200,
            'message' => 'Sensor actualizado correctamente',
            'data' => $sensor,
        ], 200);
    }

    public function DeleteFeed(Request $request, $sensorKey)
    {
        // Lógica para manejar la solicitud de eliminación de un sensor en específico
        $sensor = Sensor::where('key', $sensorKey)->first();

        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado',
            ], 404);
        }

        $sensor->delete();

        return response()->json([
            'statusCode' => 200,
            'message' => 'Sensor eliminado correctamente',
        ], 200);
    }

    // Ingesta externa (Node bridge) para almacenar datos entrantes de Adafruit vía WebSocket
    public function Ingest(Request $request)
    {
        // Seguridad: se requiere aio_key (header X-AIO-KEY o campo JSON aio_key) que debe coincidir con env('AIO_KEY')
        $expectedAio = env('AIO_KEY');
        if (!$expectedAio) {
            return response()->json(['statusCode' => 500, 'message' => 'AIO_KEY no configurado en el backend'], 500);
        }
        $providedAio = $request->header('X-AIO-KEY');
        if (!$providedAio) {
            $providedAio = $request->input('aio_key');
        }
        if (!$providedAio || !hash_equals($expectedAio, $providedAio)) {
            return response()->json(['statusCode' => 401, 'message' => 'AIO key inválida'], 401);
        }

        // JSON esperado (ejemplo): {"feed_name":"sensor-gas","value":"2059","timestamp":"2025-08-13T01:43:18.580Z","aio_key":"***"}
        $validated = validator($request->all(), [
            'feed_name'  => 'required|string|max:255',
            'value'      => 'required|string|max:255',
            'timestamp'  => 'nullable|date',
            'aio_key'    => 'sometimes', // ya validado manualmente
        ])->validate();

        $sensor = Sensor::where('key', $validated['feed_name'])->first();
        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado (feed_name no coincide con sensor.key)',
            ], 404);
        }

        // Generar un feed_id numérico (requerido por migración). Usamos tiempo + aleatorio para minimizar colisiones.
        $feedId = (int) (microtime(true) * 1000) % 2147483647; // cabe en unsignedBigInteger; ajuste simple
        if ($feedId <= 0) {
            $feedId = random_int(1, PHP_INT_MAX);
        }

        $sensorData = SensorData::create([
            'sensor_key'  => $sensor->key,
            'feed_key'    => $validated['feed_name'],
            'feed_id'     => $feedId,
            'value'       => $validated['value'],
            'received_at' => $validated['timestamp'] ?? now(),
        ]);

        return response()->json([
            'statusCode' => 201,
            'message' => 'Dato almacenado',
            'data' => $sensorData,
        ], 201);
    }
}
