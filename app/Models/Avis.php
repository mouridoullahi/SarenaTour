<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    //
    protected $table = 'avis';
protected $fillable = ['nom', 'ville', 'message', 'photo', 'approuve'];
protected $casts = ['approuve' => 'boolean'];
}
