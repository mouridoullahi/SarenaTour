<div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #111111;">
    <h2 style="color: #F26B1D;">Nouvel avis à valider</h2>

    <p>
        <strong>{{ $avis->nom }}</strong>
        @if($avis->ville) — {{ $avis->ville }} @endif
    </p>

    <blockquote style="margin: 16px 0; padding: 12px 16px; background: #FFF4EC; border-left: 4px solid #F26B1D;">
        {!! nl2br(e($avis->message)) !!}
    </blockquote>

    @if($avis->photo)
        <p style="color: #555555;">Une photo est jointe à cet avis (visible dans l'administration).</p>
    @endif

    <p>
        <a href="{{ config('services.frontend_url') }}/admin"
           style="display: inline-block; background: #F26B1D; color: #ffffff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">
            Ouvrir l'administration
        </a>
    </p>
</div>