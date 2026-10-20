<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lieu extends Model
{
    use HasFactory;

    // Ajoute ces lignes :
    protected $fillable = [
        'nom',
        'region',
        'description',
        'image',
    ];
}
