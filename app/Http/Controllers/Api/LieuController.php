<?php

namespace App\Http\Controllers\Api;
use App\Models\Lieu;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LieuController extends Controller
{
    public function index()
    {
        // Récupère tous les lieux touristiques de la base de données
        $Lieu = Lieu::all();

       // Renvoie les données au format JSON
        return response()->json($Lieu);
    }
}
