'use client'; // Cette section réagit aux clics (ouvrir le formulaire) et charge des données : elle doit être « client »

import { useState, useEffect } from 'react';
import { Quote, ImagePlus, X } from 'lucide-react'; // petites icônes
import { API, imgUrl } from '../lib/config';       // adresse de Laravel + fonction des images

// Forme d'un avis reçu de Laravel
interface Avis {
  id: number;
  nom: string;
  ville?: string | null;   // facultatif
  message: string;
  photo?: string | null;   // facultatif
}

const titres = 'font-[family-name:var(--font-serif)]'; // police des titres
const MAX_PHOTO_MO = 4;                                // taille maximale d'une photo, en Mo

export default function AvisSection() {
  // --- Mémoire de la section ---
  const [avis, setAvis] = useState<Avis[]>([]);                                  // avis publiés
  const [ouvert, setOuvert] = useState(false);                                   // formulaire ouvert ou fermé
  const [photo, setPhoto] = useState<File | null>(null);                         // photo choisie par le visiteur
  const [statut, setStatut] = useState<'repos' | 'envoi' | 'ok' | 'erreur'>('repos'); // état de l'envoi
  const [messageErreur, setMessageErreur] = useState('');                        // texte de l'erreur à afficher

  // --- Chargement des avis publiés (une seule fois, à l'ouverture de la page) ---
  useEffect(() => {
    let annule = false; // devient true si React nettoie l'effet
    fetch(`${API}/api/avis`, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (!annule && Array.isArray(data)) setAvis(data); })
      .catch(() => {}); // si Laravel ne répond pas : on affiche simplement « aucun avis »
    return () => { annule = true; };
  }, []);

  // --- Quand le visiteur choisit une photo : on vérifie sa taille ---
  const choisirPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0] ?? null;
    if (fichier && fichier.size > MAX_PHOTO_MO * 1024 * 1024) {
      setMessageErreur(`Cette photo est trop lourde (maximum ${MAX_PHOTO_MO} Mo).`);
      setStatut('erreur');
      e.target.value = '';
      return;
    }
    setStatut('repos');
    setPhoto(fichier);
  };

  // --- Envoi du formulaire vers Laravel ---
  const envoyer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                 // empêche le rechargement de la page
    const form = e.currentTarget;       // à garder AVANT le await
    const donnees = new FormData(form); // récupère nom, ville, message
    if (photo) donnees.set('photo', photo); else donnees.delete('photo');

    setStatut('envoi');
    setMessageErreur('');
    try {
      const res = await fetch(`${API}/api/avis`, {
        method: 'POST',
        headers: { Accept: 'application/json' }, // pas de Content-Type : le navigateur le gère pour les fichiers
        body: donnees,
      });
      if (!res.ok) {
        // Laravel renvoie la raison du refus : on affiche la première
        const corps = await res.json().catch(() => null);
        const premiere = corps?.errors ? Object.values(corps.errors).flat()[0] : null;
        throw new Error(typeof premiere === 'string' ? premiere : `Erreur ${res.status}`);
      }
      setStatut('ok');
      setPhoto(null);
      form.reset();
    } catch (err) {
      setMessageErreur(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setStatut('erreur');
    }
  };

  // Style commun des champs
  const champ = 'w-full px-4 py-3 rounded-md border border-[#D9D9D9] bg-white focus:outline-none focus:border-[#F26B1D] text-sm';

  return (
    <section id="temoignages" className="py-24 bg-[#F7F7F7]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8">

        {/* Deux colonnes : titre à gauche (reste visible en défilant), avis à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12">

          {/* ===== COLONNE GAUCHE : titre + bouton ===== */}
          <div className="lg:sticky lg:top-32 self-start">
            <p className="text-[#F26B1D] font-bold text-sm uppercase tracking-widest mb-3">Avis</p>
            <h2 className={`${titres} text-4xl sm:text-5xl font-extrabold leading-[1.05]`}>
              Ils sont partis, <span className="text-[#F26B1D]">ils racontent.</span>
            </h2>
            <p className="text-[#555555] mt-5 max-w-sm">
              Vous avez voyagé avec nous ? Quelques lignes (et une photo si vous voulez) aident les prochains voyageurs.
            </p>
            {/* Bouton qui ouvre / ferme le formulaire */}
            <button
              type="button"
              onClick={() => { setOuvert(!ouvert); setStatut('repos'); }}
              className="mt-8 bg-[#111111] hover:bg-[#F26B1D] text-white font-bold px-6 py-3 rounded-md text-sm transition-colors"
            >
              {ouvert ? 'Fermer' : 'Raconter mon voyage'}
            </button>
          </div>

          {/* ===== COLONNE DROITE : les avis ===== */}
          <div>
            {avis.length === 0 ? (
              // Aucun avis publié : on le dit honnêtement (pas de faux avis)
              <div className="border border-dashed border-[#CFCFCF] rounded-lg p-10 text-center bg-white">
                <p className={`${titres} text-2xl font-extrabold`}>Pas encore d'avis publié</p>
                <p className="text-[#555555] mt-2">Soyez le premier à raconter votre voyage.</p>
              </div>
            ) : (
              // columns-1 / md:columns-2 : les avis se rangent en colonnes, chacun garde sa hauteur
              <div className="columns-1 md:columns-2 gap-5">
                {avis.map((a) => (
                  // break-inside-avoid : un avis n'est jamais coupé entre deux colonnes
                  <article key={a.id} className="break-inside-avoid mb-5 bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
                    {a.photo && <img src={imgUrl(a.photo)} alt={`Voyage de ${a.nom}`} className="w-full h-44 object-cover" />}
                    <div className="p-6">
                      <Quote size={22} className="text-[#F26B1D] mb-3" />
                      <p className="text-[#333333] leading-relaxed whitespace-pre-line">{a.message}</p>
                      {/* Signature : initiale dans un carré noir + nom + ville */}
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#EDEDED]">
                        <span className="w-9 h-9 grid place-items-center bg-[#111111] text-white font-bold text-sm rounded-sm">
                          {a.nom.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-sm leading-tight">{a.nom}</p>
                          {a.ville && <p className="text-xs text-[#777777]">{a.ville}</p>}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== FORMULAIRE (visible seulement quand « ouvert » est vrai) ===== */}
        {ouvert && (
          <form onSubmit={envoyer} className="mt-12 max-w-3xl bg-white rounded-lg border border-[#E5E5E5] p-8 space-y-5">
            <h3 className={`${titres} text-2xl font-extrabold`}>Racontez votre voyage</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Votre prénom ou nom</label>
                <input name="nom" required maxLength={120} placeholder="Ex : Marie" className={champ} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Votre ville (facultatif)</label>
                <input name="ville" maxLength={120} placeholder="Ex : Lyon, France" className={champ} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Votre avis</label>
              <textarea name="message" required minLength={10} maxLength={2000} rows={5}
                placeholder="Ce que vous avez aimé, ce qui vous a surpris…" className={champ} />
            </div>

            {/* Choix de la photo : le vrai champ est caché, l'étiquette sert de bouton */}
            <div>
              <label className="block text-sm font-semibold mb-2">Une photo (facultatif)</label>
              <label className="flex items-center justify-center gap-2 py-3 rounded-md border border-dashed border-[#BDBDBD] text-sm font-semibold text-[#D95A10] cursor-pointer hover:bg-[#FFF4EC] transition">
                <ImagePlus size={18} />
                {photo ? photo.name : 'Ajouter une photo'}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={choisirPhoto} className="hidden" />
              </label>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} className="mt-2 inline-flex items-center gap-1 text-xs text-[#777777] hover:text-red-600">
                  <X size={14} /> Retirer la photo
                </button>
              )}
            </div>

            <button type="submit" disabled={statut === 'envoi'}
              className="bg-[#F26B1D] hover:bg-[#D95A10] disabled:opacity-60 text-white font-bold px-8 py-3.5 rounded-md transition">
              {statut === 'envoi' ? 'Envoi…' : 'Envoyer mon avis'}
            </button>

            {/* Messages après l'envoi */}
            {statut === 'ok' && <p className="text-sm font-semibold text-[#D95A10]">Merci ! Votre avis sera publié après validation.</p>}
            {statut === 'erreur' && <p className="text-sm text-red-600">{messageErreur || 'Une erreur est survenue.'}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
