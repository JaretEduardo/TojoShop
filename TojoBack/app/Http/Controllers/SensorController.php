<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sensor;
use App\Models\SensorData;
use App\Events\SensorDataIngested;

class SensorController extends Controller
{
    public function GetLastData(Request $request)
    {
        // Validar la fecha de entrada
        $validated = validator($request->all(), [
            'date' => 'required|date_format:Y-m-d',
        ])->validate();

        $selectedDate = $validated['date'];
        
        // Obtener todos los datos RFID del día seleccionado
        $rfidData = SensorData::where('sensor_key', 'rfid-uid')
            ->whereDate('received_at', $selectedDate)
            ->orderBy('received_at', 'asc')
            ->get();

        // Agrupar por valor RFID (cada empleado)
        $groupedByRfid = $rfidData->groupBy('value');
        
        $timeRecords = [];
        
        foreach ($groupedByRfid as $rfidValue => $scans) {
            // Buscar el usuario vinculado a este RFID
            $rfidAuth = \App\Models\RFIDAuth::where('value', $rfidValue)
                ->with('user')
                ->first();
            
            if (!$rfidAuth || !$rfidAuth->user) {
                continue; // Saltar RFIDs no vinculados
            }
            
            $user = $rfidAuth->user;
            
            // Ordenar escaneos por tiempo
            $orderedScans = $scans->sortBy('received_at');
            
            // Determinar entrada y salida
            $entryTime = $orderedScans->first()->received_at;
            $exitTime = null;
            $totalHours = 0;
            
            // Si hay más de un escaneo, el último es la salida
            if ($orderedScans->count() > 1) {
                $exitTime = $orderedScans->last()->received_at;
                
                // Calcular horas trabajadas
                $timeDiff = $exitTime->diffInMinutes($entryTime);
                $totalHours = round($timeDiff / 60, 2);
            } else {
                // Si solo hay un escaneo y es del día actual, calcular tiempo trabajado hasta ahora
                if ($selectedDate === now()->format('Y-m-d')) {
                    $timeDiff = now()->diffInMinutes($entryTime);
                    $totalHours = round($timeDiff / 60, 2);
                }
            }
            
            $timeRecords[] = [
                'employeeId' => 'EMP' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
                'employeeName' => $user->name,
                'entryTime' => $entryTime->toISOString(),
                'exitTime' => $exitTime ? $exitTime->toISOString() : null,
                'totalHours' => $totalHours,
                'rfidValue' => $rfidValue
            ];
        }
        
        return response()->json([
            'statusCode' => 200,
            'message' => 'Registros de tiempo obtenidos correctamente',
            'data' => $timeRecords,
            'date' => $selectedDate
        ], 200);
    }

    public function CreateData(Request $request)
    {
        // Lógica para manejar la solicitud de creación de datos de sensores
    }

    public function UpdateDataPoint(Request $request, $dataId)
    {
        // Validar los datos de entrada
        $validated = validator($request->all(), [
            'value' => 'required|string|max:255',
            'received_at' => 'nullable|date',
        ])->validate();

        // Buscar el punto de datos por ID
        $sensorData = SensorData::find($dataId);
        
        if (!$sensorData) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Punto de datos no encontrado',
            ], 404);
        }

        // Actualizar los campos
        $sensorData->value = $validated['value'];
        if (isset($validated['received_at'])) {
            $sensorData->received_at = $validated['received_at'];
        }
        
        $sensorData->save();

        // Emitir evento broadcast para notificar cambios en tiempo real
        event(new SensorDataIngested($sensorData));

        return response()->json([
            'statusCode' => 200,
            'message' => 'Punto de datos actualizado correctamente',
            'data' => [
                'id' => $sensorData->id,
                'value' => $sensorData->value,
                'received_at' => $sensorData->received_at->toISOString(),
                'feed_key' => $sensorData->feed_key,
            ]
        ], 200);
    }

    public function DeleteDataPoint(Request $request, $dataId)
    {
        // Buscar el punto de datos por ID
        $sensorData = SensorData::find($dataId);
        
        if (!$sensorData) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Punto de datos no encontrado',
            ], 404);
        }

        // Eliminar el punto de datos
        $sensorData->delete();

        return response()->json([
            'statusCode' => 200,
            'message' => 'Punto de datos eliminado correctamente',
        ], 200);
    }

    public function GetFeedData(Request $request, $feedKey)
    {
        // Verificar si el feed es RFID
        if ($feedKey !== 'rfid-uid') {
            return response()->json([
                'statusCode' => 400,
                'message' => 'Este endpoint solo funciona para datos RFID',
            ], 400);
        }

        // Obtener todos los datos del sensor RFID
        $rfidData = SensorData::where('sensor_key', 'rfid-uid')
            ->select('value')
            ->distinct()
            ->get()
            ->pluck('value');

        // Obtener los valores RFID que ya están vinculados en la tabla rfidauth
        $linkedRfids = \App\Models\RFIDAuth::pluck('value');

        // Filtrar para obtener solo los RFID no vinculados
        $unlinkedRfids = $rfidData->diff($linkedRfids);

        // Obtener los datos completos de los RFID no vinculados
        $unlinkedRfidData = SensorData::where('sensor_key', 'rfid-uid')
            ->whereIn('value', $unlinkedRfids)
            ->orderBy('received_at', 'desc')
            ->get()
            ->groupBy('value')
            ->map(function ($group) {
                // Tomar solo el registro más reciente de cada valor RFID
                return $group->first();
            })
            ->values()
            ->map(function ($data) {
                return [
                    'id' => $data->id,
                    'value' => $data->value,
                    'received_at' => $data->received_at->toISOString(),
                    'feed_key' => $data->feed_key,
                ];
            });

        return response()->json([
            'statusCode' => 200,
            'message' => 'Datos RFID no vinculados obtenidos correctamente',
            'data' => $unlinkedRfidData,
        ], 200);
    }

    public function ChartFeedData(Request $request, $sensorKey)
    {
        // Buscar el sensor por su key
        $sensor = Sensor::where('key', $sensorKey)->first();
        
        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado',
            ], 404);
        }

        // Obtener datos del sensor para gráficas (últimos 100 registros)
        $chartData = SensorData::where('sensor_key', $sensor->key)
            ->orderBy('received_at', 'desc')
            ->limit(100)
            ->get()
            ->reverse() // Invertir para mostrar cronológicamente
            ->values() // Reindexar
            ->map(function ($data) {
                return [
                    'id' => $data->id,
                    'value' => $data->value,
                    'received_at' => $data->received_at->toISOString(),
                    'feed_key' => $data->feed_key,
                ];
            });

        return response()->json([
            'statusCode' => 200,
            'message' => 'Datos para gráfica obtenidos correctamente',
            'data' => $chartData,
            'sensor' => [
                'key' => $sensor->key,
                'name' => $sensor->name,
                'type_data' => $sensor->type_data,
                'min_value' => $sensor->min_value,
                'max_value' => $sensor->max_value,
                'status' => $sensor->status,
            ]
        ], 200);
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
        // Buscar el sensor por su key
        $sensor = Sensor::where('key', $sensorKey)->first();
        
        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado',
            ], 404);
        }

        // Obtener todos los datos históricos del sensor ordenados por fecha descendente
        $sensorData = SensorData::where('sensor_key', $sensor->key)
            ->orderBy('received_at', 'desc')
            ->get()
            ->map(function ($data) {
                return [
                    'id' => $data->id,
                    'value' => $data->value,
                    'received_at' => $data->received_at->toISOString(),
                    'feed_key' => $data->feed_key,
                ];
            });

        return response()->json([
            'statusCode' => 200,
            'message' => 'Datos del sensor obtenidos correctamente',
            'data' => $sensorData,
            'sensor' => [
                'key' => $sensor->key,
                'name' => $sensor->name,
                'type_data' => $sensor->type_data,
                'min_value' => $sensor->min_value,
                'max_value' => $sensor->max_value,
                'status' => $sensor->status,
            ]
        ], 200);
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
        // Permitimos fallback a ADAFRUIT_AIO_KEY para no romper si el .env existente usa otro nombre
        $expectedAio = env('AIO_KEY') ?: env('ADAFRUIT_AIO_KEY');
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

    // Emitir evento broadcast
    event(new SensorDataIngested($sensorData));

        return response()->json([
            'statusCode' => 201,
            'message' => 'Dato almacenado',
            'data' => $sensorData,
        ], 201);
    }

    // Obtener datos recientes de un sensor específico
    public function GetSensorRecentData(Request $request, $sensorKey)
    {
        $sensor = Sensor::where('key', $sensorKey)->first();
        if (!$sensor) {
            return response()->json([
                'statusCode' => 404,
                'message' => 'Sensor no encontrado',
            ], 404);
        }

        // Obtener últimos 50 registros de datos del sensor
        $recentData = SensorData::where('sensor_key', $sensor->key)
            ->orderBy('received_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($data) {
                return [
                    'id' => $data->id,
                    'value' => $data->value,
                    'received_at' => $data->received_at->toISOString(),
                    'feed_key' => $data->feed_key,
                ];
            });

        return response()->json([
            'statusCode' => 200,
            'message' => 'Datos obtenidos correctamente',
            'data' => $recentData,
            'sensor' => [
                'key' => $sensor->key,
                'name' => $sensor->name,
                'type_data' => $sensor->type_data,
                'min_value' => $sensor->min_value,
                'max_value' => $sensor->max_value,
            ]
        ], 200);
    }

    public function vincularRFID(Request $request)
    {
        // Validar los datos de entrada
        $validated = validator($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'rfid_value' => 'required|string|max:255',
        ])->validate();

        // Verificar si el RFID ya está vinculado
        $existingRFID = \App\Models\RFIDAuth::where('value', $validated['rfid_value'])->first();
        if ($existingRFID) {
            return response()->json([
                'statusCode' => 400,
                'message' => 'Este RFID ya está vinculado a otro usuario',
            ], 400);
        }

        // Crear la vinculación RFID
        $rfidAuth = \App\Models\RFIDAuth::create([
            'user_id' => $validated['user_id'],
            'value' => $validated['rfid_value'],
        ]);

        return response()->json([
            'statusCode' => 200,
            'message' => 'RFID vinculado correctamente al usuario',
            'data' => $rfidAuth
        ], 200);
    }
}
