<?php

namespace App\Mail;

use App\Models\Avis;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NouvelAvis extends Mailable
{
    public function __construct(public Avis $avis)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvel avis à valider : ' . $this->avis->nom,
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.nouvel-avis');
    }
}