<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LieuController; // 1. L'importation
use App\Models\Demande;
use App\Http\Controllers\AvisController;
use App\Http\Middleware\AdminToken;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// 2. Ta route pour les lieux touristiques
Route::get('/lieux', [LieuController::class, 'index']);



Route::post('/demandes', function (Request $request) {
    $data = $request->validate([
        'nom'     => 'required|string|max:120',
        'email'   => 'nullable|email|max:190',
        'message' => 'required|string|max:3000',
    ]);
    Demande::create($data);
    return response()->json(['message' => 'Demande enregistrée'], 201);
})->middleware('throttle:5,1');



Route::get('/avis', [AvisController::class, 'index']);
Route::post('/avis', [AvisController::class, 'store'])->middleware('throttle:5,1');




Route::middleware([AdminToken::class, 'throttle:60,1'])->prefix('admin')->group(function () {
    Route::get('/avis', [AvisController::class, 'adminIndex']);
    Route::patch('/avis/{avis}', [AvisController::class, 'adminUpdate']);
    Route::delete('/avis/{avis}', [AvisController::class, 'adminDestroy']);
});