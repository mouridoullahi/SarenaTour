<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = config('services.admin_token');

        if (!$token || !hash_equals($token, (string) $request->bearerToken())) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        return $next($request);
    }
}