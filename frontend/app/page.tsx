'use client'; // Obligatoire en 1re ligne : cette page utilise useState/useEffect (elle réagit aux clics et charge des données)

import { useState, useEffect } from 'react';
import PourquoiSection from '../components/PourquoiSection'; // section « Pourquoi nous » (fichier séparé)
import AvisSection from '../components/AvisSection';         // section des avis voyageurs (fichier séparé)
import WhatsAppIcon from '../components/WhatsAppIcon';       // logo WhatsApp
import MobileMenu from '../components/MobileMenu';           // menu « trois traits » du téléphone


/* =====================================================
   1. RÉGLAGES : les seules lignes à modifier en général
   ===================================================== */
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'; // adresse de Laravel
const WA_NUMBER = '221774637704';       // numéro WhatsApp, format international sans +
const PHONE_DISPLAY = '+221 77 463 77 04'; // numéro affiché sur le site
const EMAIL = 'ongom9611@gmail.com';

/* =====================================================
   2. OUTILS (fonctions réutilisées dans la page)
   ===================================================== */

// Forme d'une excursion reçue de Laravel (les champs qui existent dans la table « lieux »)
interface Lieu {
  id: number;
  nom: string;
  region?: string;          // le « ? » veut dire : facultatif
  description: string;
  image: string;
  points?: string[] | null;
}

// Transforme le nom d'une image en adresse complète : « Baobab.jpg » -> « http://127.0.0.1:8000/images/Baobab.jpg »
const imgUrl = (img?: string | null) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;                    // déjà une adresse complète
  const path = img.startsWith('/') ? img.slice(1) : img;
  return encodeURI(path.startsWith('images/') ? `${API}/${path}` : `${API}/images/${path}`); // encodeURI gère les espaces
};

// Crée un lien WhatsApp avec un message déjà écrit
const waLink = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// Classes de style réutilisées (pour ne pas les réécrire partout)
const titres = 'font-[family-name:var(--font-serif)]'; // police des titres (définie dans layout.tsx)
const surtitre = 'text-[#F26B1D] font-bold text-sm uppercase tracking-widest'; // petit texte orange au-dessus des titres

// Liens du menu : [texte affiché, section visée]
const MENU = [
  ['À propos', '#apropos'],
  ['Destinations', '#destinations'],
  ['Pourquoi nous', '#pourquoi'],
  ['Avis', '#temoignages'],
  ['Contact', '#contact'],
];

// Puces par excursion. La clé = un mot qui apparaît dans le nom de l'excursion (en minuscules).
// Pour ajouter une excursion : ajoutez une ligne  mot: ['puce 1', 'puce 2', 'puce 3'],
const POINTS: Record<string, string[]> = {
  bandia:     ['Safari au Sénégal', 'Animaux sauvages en liberté', 'Excursion proche de Dakar'],
  lompoul:    ['Désert du Sénégal', 'Dromadaire et dunes', 'Nuit sous les étoiles'],
  saloum:     ['Delta du Saloum UNESCO', 'Balade en pirogue', 'Observation des oiseaux'],
  fathala:    ['Safari au Sénégal', 'Lions et rhinocéros', 'Expérience unique'],
  gorée:      ['Île de Gorée visite', 'Maison des Esclaves', 'Histoire du Sénégal'],
  saly:       ['Plage Saly Sénégal', 'Lagune de Somone', 'Excursion détente'],
  'lac rose': ['Lac Rose Sénégal', 'Extraction du sel', 'Balade en 4×4'],
  fadiouth:   ['Île de Fadiouth', 'Culture sérère', 'Rencontres locales'],
  mbour:      ['Le port de pêche artisanal', 'Le marché central', 'Proche des stations balnéaires'],
};

// Donne les puces d'une excursion : d'abord celles de la base Laravel, sinon celles du tableau ci-dessus
const pointsPour = (lieu: Lieu): string[] => {
  if (lieu.points?.length) return lieu.points;
  const cle = Object.keys(POINTS).find((k) => lieu.nom.toLowerCase().includes(k));
  return cle ? POINTS[cle] : [];
};

/* =====================================================
   3. LA PAGE
   ===================================================== */
export default function Home() {
  // --- Mémoire de la page (ce que React « retient ») ---
  const [lieux, setLieux] = useState<Lieu[]>([]);               // liste des excursions
  const [loading, setLoading] = useState(true);                 // true tant que les excursions chargent
  const [error, setError] = useState<string | null>(null);      // message d'erreur éventuel
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle'); // état du formulaire de devis
  const [waText, setWaText] = useState('');                     // message WhatsApp préparé après l'envoi du formulaire

  // --- Chargement des excursions : s'exécute une fois à l'ouverture de la page ---
  useEffect(() => {
    let cancelled = false;                                      // devient true si React nettoie l'effet (évite les erreurs)
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);   // abandonne si Laravel ne répond pas en 8 s

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/lieux`, { headers: { Accept: 'application/json' }, signal: controller.signal });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setError(null);
        setLieux(Array.isArray(data) ? data : data.data ?? data.lieux ?? []); // accepte plusieurs formes de réponse
        setLoading(false);
      } catch (err) {
        if (cancelled) return;                                  // annulation voulue : on ignore
        setError(err instanceof DOMException && err.name === 'AbortError' ? 'Laravel ne répond pas' : err instanceof Error ? err.message : 'Erreur');
        setLoading(false);
      } finally {
        clearTimeout(timer);
      }
    };
    load();
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); }; // nettoyage
  }, []);

  // --- Envoi du formulaire de devis vers Laravel (table « demandes ») ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                                         // empêche le rechargement de la page
    const form = e.currentTarget;                               // à garder AVANT le await
    const f = new FormData(form);                               // récupère les champs saisis
    const nom = String(f.get('nom'));
    const email = String(f.get('email') || '');
    const projet = String(f.get('projet'));

    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/demandes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ nom, email: email || null, message: projet }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setWaText(`Bonjour, je viens d'envoyer une demande de devis sur votre site.\nNom : ${nom}\nProjet : ${projet}`);
      setStatus('ok');
      form.reset();                                             // vide le formulaire
    } catch {
      setStatus('error');
    }
  };

  // Style commun des champs du formulaire
  const champ = 'w-full px-4 py-3 rounded-md border border-[#D9D9D9] bg-white focus:outline-none focus:border-[#F26B1D] text-base';

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">

      {/* ================= EN-TÊTE (menu collé en haut) ================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EDEDED]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-3">
          {/* Logo + nom */}
          <div className="flex items-center gap-3">
            <img src={imgUrl('Logo Sarena Touristique.png')} alt="Logo SarenaTour" className="w-12 h-12 object-contain rounded-md bg-white shadow" />
            <span className={`${titres} hidden sm:block text-xl font-extrabold tracking-tight`}>
              Sarena<span className="text-[#F26B1D]">Tour</span>
            </span>
          </div>

          {/* Menu visible sur ordinateur seulement (hidden md:flex) */}
          <nav className="hidden md:flex items-center gap-2">
  {MENU.map(([texte, lien]) => (
    <a key={lien} href={lien}
        className="px-5 py-2 rounded-full text-sm font-semibold bg-[#111111] text-white hover:bg-[#F26B1D] transition-colors">
      {texte}
    </a>
  ))}
</nav>

          {/* Bouton WhatsApp + menu « trois traits » (téléphone) */}
          <div className="flex items-center gap-3">
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold px-4 py-2.5 rounded-md text-sm transition">
              <WhatsAppIcon size={18} /> WhatsApp
            </a>
            <MobileMenu links={MENU} />
          </div>
        </div>
      </header>

      {/* Bouton WhatsApp rond, toujours visible en bas à droite (fixed) */}
      <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white grid place-items-center shadow-xl transition">
        <WhatsAppIcon size={30} />
      </a>

      {/* ================= BANNIÈRE D'ACCUEIL (hero) : texte aligné à gauche ================= */}
      <section className="relative text-white min-h-[85vh] flex items-end overflow-hidden">
        {/* Photo de fond + dégradé noir pour que le texte reste lisible */}
        <img src={imgUrl('Baobab.jpg')} alt="Baobabs du Sénégal" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="relative max-w-[1200px] mx-auto w-full px-6 sm:px-8 pb-16 sm:pb-24 pt-40">
          <p className="text-[#FF9A52] font-bold text-sm uppercase tracking-widest mb-5">Mbour · Sénégal</p>
          <h1 className={`${titres} text-5xl sm:text-7xl font-extrabold leading-[1.02] max-w-3xl`}>
            Le Sénégal, <span className="text-[#F26B1D]">vu par quelqu'un d'ici.</span>
          </h1>
          <p className="text-lg text-white/85 max-w-xl mt-6">
            Excursions à la journée ou circuits sur mesure : on part ensemble, vous choisissez le rythme.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <a href="#contact" className="bg-[#F26B1D] hover:bg-[#D95A10] text-white font-bold px-7 py-4 rounded-md transition">
              Planifier mon voyage
            </a>
            <a href="#destinations" className="border-2 border-white/70 hover:bg-white hover:text-[#111111] text-white font-bold px-7 py-4 rounded-md transition">
              Voir les destinations
            </a>
          </div>
        </div>
      </section>

      {/* ================= À PROPOS : photo en arche à gauche, texte à droite ================= */}
      <section id="apropos" className="py-24 max-w-[1200px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* « flotte » = animation de flottement (définie dans globals.css) */}
        <div className="relative w-full max-w-[340px] mx-auto flotte">
          <img
            src={imgUrl('Sarena.jpeg')}
            alt="Votre guide à Mbour"
            // aspect-[3/4] = forme portrait ; rounded-t-[999px] = haut en arche ; object-top = garde le visage visible
            className="relative w-full aspect-[3/4] object-cover object-top rounded-t-[999px] rounded-b-lg shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-500 hover:scale-[1.04]"
          />
          {/* Pastille « 6 ans » posée sur le coin de la photo */}
          <div className="absolute -bottom-5 -left-5 bg-[#111111] text-white rounded-md px-5 py-4 shadow-xl">
            <p className={`${titres} text-3xl font-extrabold text-[#F26B1D]`}>6 ans</p>
            <p className="text-sm text-white/80">de terrain au Sénégal</p>
          </div>
        </div>

        <div>
          <p className={`${surtitre} mb-3`}>Qui suis-je ?</p>
          <h2 className={`${titres} text-4xl sm:text-5xl font-extrabold leading-tight mb-6`}>
            Un guide né ici, pour que vous voyagiez <span className="text-[#F26B1D]">comme chez vous.</span>
          </h2>
          <p className="text-[#444444] text-lg leading-relaxed mb-4">
            Je vis à Mbour et je fais découvrir mon pays depuis 6 ans à des voyageurs venus du monde entier.
            Mon travail : vous éviter les pièges, vous ouvrir les bonnes portes.
          </p>
          <p className="text-[#444444] text-lg leading-relaxed mb-8">
            Pas de programme figé : on part de vos envies, de votre budget et de votre temps.
          </p>
          {/* Trois repères en ligne */}
          <ul className="flex flex-wrap gap-x-8 gap-y-3 font-semibold">
            {['Guide local', 'Excursions fiables', 'Voyage sur mesure'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-2 h-2 bg-[#F26B1D]" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= DESTINATIONS : mosaïque de cartes (données de Laravel) ================= */}
      <section id="destinations" className="max-w-[1200px] mx-auto px-6 sm:px-8 py-24 w-full">
        {/* En-tête : titre à gauche, phrase à droite */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <p className={`${surtitre} mb-3`}>Nos destinations</p>
            <h2 className={`${titres} text-4xl sm:text-5xl font-extrabold leading-[1.05]`}>Où voulez-vous aller ?</h2>
          </div>
          <p className="max-w-sm text-[#555555]">Choisissez une destination : transport, horaires et rencontres, on organise le reste.</p>
        </div>

        {/* 4 cas possibles : chargement / erreur / liste vide / liste d'excursions */}
        {loading ? (
          <p className="text-center py-24 text-[#555555] font-semibold">Chargement des destinations…</p>
        ) : error ? (
          <div className="text-center py-16 border border-dashed border-red-300 rounded-lg">
            <p className="text-red-600 font-bold">Impossible de charger les destinations ({error}).</p>
            <p className="text-sm text-[#555555] mt-2">Vérifiez que Laravel tourne sur {API}.</p>
          </div>
        ) : lieux.length === 0 ? (
          <p className="text-center py-24 text-[#555555]">Aucune destination pour le moment.</p>
        ) : (
          // Grille : 1 colonne (téléphone), 2 (tablette), 3 (ordinateur)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
            {lieux.map((lieu, i) => {
              const points = pointsPour(lieu);
              return (
                // Une carte. « group » permet aux éléments à l'intérieur de réagir au survol de la carte.
                // Une carte sur cinq est plus large (lg:col-span-2).
                <article key={lieu.id}
                  className={`group relative h-[420px] overflow-hidden rounded-lg bg-[#111111] ${i % 5 === 0 ? 'lg:col-span-2' : ''}`}>
                  {lieu.image && (
                    <img src={imgUrl(lieu.image)} alt={lieu.nom}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  {/* Dégradé noir en bas pour lire le texte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Numéro (01, 02…) en haut à gauche, région en haut à droite */}
                  <span className="absolute top-4 left-4 bg-white text-[#111111] text-xs font-bold px-2 py-1 rounded-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {lieu.region && (
                    <span className="absolute top-4 right-4 border border-white/60 text-white text-xs px-2 py-1 rounded-sm">{lieu.region}</span>
                  )}

                  {/* Texte en bas de la carte */}
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                    <h3 className={`${titres} text-2xl sm:text-3xl font-extrabold leading-tight`}>{lieu.nom}</h3>
                    {/* Ordinateur : description visible au survol. Téléphone : toujours visible. */}
                    <div className="md:max-h-0 md:opacity-0 md:group-hover:max-h-52 md:group-hover:opacity-100 overflow-hidden transition-all duration-500">
                      <p className="text-white/85 text-sm leading-relaxed mt-3 line-clamp-3">{lieu.description}</p>
                      {points.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {points.slice(0, 3).map((p) => (
                            <span key={p} className="text-xs border border-white/40 px-2 py-1 rounded-sm">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Bouton : ouvre WhatsApp avec le nom de l'excursion dans le message */}
                    <a href={waLink(`Bonjour, je voudrais organiser cette sortie : ${lieu.nom}`)} target="_blank" rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 bg-[#F26B1D] hover:bg-white hover:text-[#111111] text-white font-bold text-sm px-4 py-2.5 rounded-md transition-colors">
                      Je réserve <span aria-hidden>→</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= SECTIONS EN FICHIERS SÉPARÉS ================= */}
      <PourquoiSection />   {/* components/PourquoiSection.tsx */}
      <AvisSection />       {/* components/AvisSection.tsx : avis + formulaire « Laisser un avis » */}

      {/* ================= CONTACT : coordonnées à gauche, formulaire de devis à droite ================= */}
      <section id="contact" className="py-24 bg-[#FFF4EC] border-t border-[#EDEDED]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <p className={`${surtitre} mb-3`}>Contact</p>
          <h2 className={`${titres} text-4xl sm:text-5xl font-extrabold mb-12`}>Parlons de votre voyage</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
            {/* Bloc noir : coordonnées (la liste se modifie facilement dans le tableau) */}
            <div className="bg-[#111111] text-white rounded-lg p-8 space-y-6">
              <p className="text-white/80">Basé à Pointe Sarène, je réponds le plus vite sur WhatsApp.</p>
              {[
                ['WhatsApp', PHONE_DISPLAY, `https://wa.me/${WA_NUMBER}`],
                ['Email', EMAIL, `mailto:${EMAIL}`],
                ['Où nous trouver', 'Mbour, Sénégal', ''],
              ].map(([label, valeur, lien]) => (
                <div key={label} className="border-t border-white/15 pt-4">
                  <p className="text-xs uppercase tracking-widest text-[#FF9A52] mb-1">{label}</p>
                  {lien ? <a href={lien} className="font-semibold break-all hover:text-[#FF9A52]">{valeur}</a> : <p className="font-semibold">{valeur}</p>}
                </div>
              ))}
            </div>

            {/* Formulaire de devis */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E5E5E5] p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Votre nom</label>
                  <input name="nom" required className={champ} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email (facultatif)</label>
                  <input name="email" type="email" className={champ} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Votre projet</label>
                <textarea name="projet" rows={5} required className={champ}
                  placeholder="Dates, nombre de personnes, destinations qui vous font envie…" />
              </div>
              <button type="submit" disabled={status === 'loading'}
                className="bg-[#F26B1D] hover:bg-[#D95A10] disabled:opacity-60 text-white font-bold px-8 py-3.5 rounded-md transition">
                {status === 'loading' ? 'Envoi…' : 'Envoyer ma demande'}
              </button>

              {/* Messages après l'envoi */}
              {status === 'ok' && (
                <div className="rounded-md bg-[#FFF4EC] border border-[#FFD9BF] p-4 text-sm">
                  <p className="font-semibold">Merci ! Votre demande est bien enregistrée.</p>
                  <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="underline text-[#D95A10]">Continuer sur WhatsApp →</a>
                </div>
              )}
              {status === 'error' && <p className="text-red-600 text-sm">Une erreur est survenue. Réessayez ou écrivez-moi sur WhatsApp.</p>}
            </form>
          </div>
        </div>
      </section>

      {/* ================= PIED DE PAGE ================= */}
      <footer className="bg-[#111111] text-white py-12">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 flex flex-wrap items-center justify-between gap-6">
          <p className={`${titres} text-2xl font-extrabold`}>Sarena<span className="text-[#F26B1D]">Tour</span></p>
          <p className="text-sm text-white/70">{PHONE_DISPLAY} · {EMAIL} · Mbour, Sénégal</p>
        </div>
        <p className="max-w-[1200px] mx-auto px-6 sm:px-8 mt-8 pt-6 border-t border-white/15 text-xs text-white/60">
          © 2026 SarenaTour — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
