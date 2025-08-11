<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:employee') or 'role:user,employee'
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $allowed = array_map(static fn($r) => trim(strtolower($r)), explode(',', $roles));
        $role = strtolower((string)($user->role ?? ''));
        if (!in_array($role, $allowed, true)) {
            return response()->json(['message' => 'Acceso no autorizado'], 403);
        }

        return $next($request);
    }
}
