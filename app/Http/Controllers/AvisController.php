<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Mail\NouvelAvis;
use Illuminate\Support\Facades\Mail;

class AvisController extends Controller
{
    // Liste des avis validés
    public function index()
    {
        return Avis::where('approuve', true)
            ->latest()
            ->get(['id', 'nom', 'ville', 'message', 'photo']);
    }

    // Enregistrement d'un nouvel avis (avec photo facultative)
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'     => 'required|string|max:120',
            'ville'   => 'nullable|string|max:120',
            'message' => 'required|string|min:10|max:2000',
            'photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $photo = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $nom  = Str::uuid() . '.' . $file->extension();
            $file->move(public_path('images/avis'), $nom);
            $photo = 'images/avis/' . $nom;
        }

                $avis = Avis::create([
            'nom'      => $data['nom'],
            'ville'    => $data['ville'] ?? null,
            'message'  => $data['message'],
            'photo'    => $photo,
            'approuve' => false,
        ]);

        // Prévient l'administrateur par email.
        // Si l'envoi échoue, l'avis reste enregistré et le visiteur ne voit aucune erreur.
        try {
            if ($to = config('services.admin_email')) {
                Mail::to($to)->send(new NouvelAvis($avis));
            }
        } catch (\Throwable $e) {
            report($e);   // l'erreur est notée dans storage/logs/laravel.log
        }

        return response()->json(['message' => 'Avis reçu'], 201);
    }

    // --- Administration ---
    public function adminIndex()
    {
        return Avis::orderBy('approuve')->latest()->get();
    }

    public function adminUpdate(Request $request, Avis $avis)
    {
        $avis->update(['approuve' => $request->boolean('approuve')]);
        return $avis;
    }

    public function adminDestroy(Avis $avis)
    {
        if ($avis->photo) {
            @unlink(public_path($avis->photo)); // supprime aussi la photo
        }
        $avis->delete();
        return response()->json(['message' => 'Supprimé']);
    }

    
}