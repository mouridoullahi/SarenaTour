    'use client'; // Obligatoire en 1re ligne : cette section réagit aux clics et au défilement

    import { useState, useEffect, useRef } from 'react';                                  // outils React : mémoire, actions, référence
    import { Quote, ImagePlus, X, ChevronLeft, ChevronRight } from 'lucide-react';        // icônes
    import { API, imgUrl } from '../lib/config';                                          // adresse de Laravel + adresse des images

    /* =====================================================
    1. TYPES ET RÉGLAGES
    ===================================================== */

    // Forme d'un avis reçu de Laravel (les champs de la table « avis »)
    interface Avis {
    id: number;
    nom: string;
    ville?: string | null;   // le « ? » veut dire : facultatif
    message: string;
    photo?: string | null;
    }

    const titres = 'font-[family-name:var(--font-serif)]'; // police des titres (définie dans layout.tsx)
    const MAX_PHOTO_MO = 4;                                // taille maximale d'une photo, en Mo

    /* =====================================================
    2. LA SECTION
    ===================================================== */
    export default function AvisSection() {

    // --- Mémoire de la section (ce que React « retient ») ---
    const [avis, setAvis] = useState<Avis[]>([]);                                        // liste des avis publiés
    const [ouvert, setOuvert] = useState(false);                                         // formulaire ouvert (true) ou fermé (false)
    const [photo, setPhoto] = useState<File | null>(null);                               // photo choisie par le visiteur
    const [statut, setStatut] = useState<'repos' | 'envoi' | 'ok' | 'erreur'>('repos');  // état de l'envoi du formulaire
    const [messageErreur, setMessageErreur] = useState('');                              // texte de l'erreur à afficher
    const [bouts, setBouts] = useState({ debut: true, fin: false });                     // sommes-nous au début / à la fin de la ligne d'avis ?

    const ligne = useRef<HTMLDivElement>(null); // « télécommande » vers la ligne d'avis qui défile

    // --- Chargement des avis publiés (une seule fois, à l'ouverture de la page) ---
    useEffect(() => {
        let annule = false; // devient true si React nettoie l'effet (évite des erreurs)
        fetch(`${API}/api/avis`, { headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => { if (!annule && Array.isArray(data)) setAvis(data); })
        .catch(() => {}); // si Laravel ne répond pas : on affiche « aucun avis »
        return () => { annule = true; };
    }, []);

    // --- Flèches : regarde si la ligne est tout au début ou tout au bout (pour griser la flèche) ---
    const majBouts = () => {
        const el = ligne.current;
        if (!el) return;
        setBouts({
        debut: el.scrollLeft <= 4,                                      // tout à gauche
        fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,      // tout à droite
        });
    };
    // Recalcule quand les avis arrivent ou quand la fenêtre change de taille
    useEffect(() => {
        majBouts();
        window.addEventListener('resize', majBouts);
        return () => window.removeEventListener('resize', majBouts); // nettoyage
    }, [avis]);

    // --- Fait défiler la ligne d'une « page » : -1 = vers la gauche, 1 = vers la droite ---
    const defiler = (sens: -1 | 1) => {
        const el = ligne.current;
        if (el) el.scrollBy({ left: sens * el.clientWidth * 0.9, behavior: 'smooth' }); // 0.9 = 90 % de la largeur visible
    };

    // --- Quand le visiteur choisit une photo : on vérifie sa taille ---
    const choisirPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fichier = e.target.files?.[0] ?? null;
        if (fichier && fichier.size > MAX_PHOTO_MO * 1024 * 1024) {
        setMessageErreur(`Cette photo est trop lourde (maximum ${MAX_PHOTO_MO} Mo).`);
        setStatut('erreur');
        e.target.value = ''; // vide le choix
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
        form.reset(); // vide le formulaire
        } catch (err) {
        setMessageErreur(err instanceof Error ? err.message : 'Une erreur est survenue.');
        setStatut('erreur');
        }
    };

    // --- Styles réutilisés ---
    const champ = 'w-full px-4 py-3 rounded-md border border-[#D9D9D9] bg-white focus:outline-none focus:border-[#F26B1D] text-sm'; // champs du formulaire
    const fleche = 'w-12 h-12 grid place-items-center rounded-full border-2 border-[#111111] text-[#111111] hover:bg-[#F26B1D] hover:border-[#F26B1D] hover:text-white transition disabled:opacity-30 disabled:pointer-events-none'; // flèches rondes

    /* =====================================================
        3. L'AFFICHAGE
        ===================================================== */
    return (
        <section id="temoignages" className="py-24 bg-[#F7F7F7]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">

            {/* ===== EN-TÊTE : tout centré (titre, phrase, bouton, puis flèches) ===== */}
            <div className="flex flex-col items-center text-center gap-8 mb-10">

            {/* Titre, phrase et bouton (max-w-2xl limite la largeur du texte) */}
            <div className="max-w-2xl">
                <p className="text-[#F26B1D] font-bold text-sm uppercase tracking-widest mb-3">Avis</p>
                <h2 className={`${titres} text-4xl sm:text-5xl font-extrabold leading-[1.05]`}>
                Ils sont partis, <span className="text-[#F26B1D]">ils racontent.</span>
                </h2>
                <p className="text-[#555555] mt-5">
                Vous avez voyagé avec nous ? Quelques lignes (et une photo si vous voulez) aident les prochains voyageurs.
                </p>
                {/* Bouton qui ouvre / ferme le formulaire */}
                <button
                type="button"
                onClick={() => { setOuvert(!ouvert); setStatut('repos'); }}
                className="mt-6 bg-[#111111] hover:bg-[#F26B1D] text-white font-bold px-6 py-3 rounded-md text-sm transition-colors"
                >
                {ouvert ? 'Fermer' : 'Raconter mon voyage'}
                </button>
            </div>

            {/* Flèches précédent / suivant (grisées quand on est au bout) : visibles seulement s'il y a des avis */}
            {avis.length > 0 && (
                <div className="flex gap-3">
                <button type="button" onClick={() => defiler(-1)} disabled={bouts.debut} aria-label="Avis précédents" className={fleche}>
                    <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={() => defiler(1)} disabled={bouts.fin} aria-label="Avis suivants" className={fleche}>
                    <ChevronRight size={22} />
                </button>
                </div>
            )}
            </div>

            {/* ===== LES AVIS : une seule ligne qui défile ===== */}
            {avis.length === 0 ? (
            // Aucun avis publié : on le dit honnêtement
            <div className="border border-dashed border-[#CFCFCF] rounded-lg p-10 text-center bg-white">
                <p className={`${titres} text-2xl font-extrabold`}>Pas encore d'avis publié</p>
                <p className="text-[#555555] mt-2">Soyez le premier à raconter votre voyage.</p>
            </div>
            ) : (
            // overflow-x-auto : défilement horizontal ; snap-x : chaque carte s'arrête bien en place ;
            // scroll-smooth : défilement doux ; la barre de défilement est cachée
            <div
                ref={ligne}
                onScroll={majBouts}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {avis.map((a) => (
                // Une carte. Largeur : presque tout l'écran sur téléphone, 2 par vue sur tablette, 3 sur ordinateur
                <article
                    key={a.id}
                    className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex flex-col bg-white rounded-lg border border-[#E5E5E5] overflow-hidden"
                >
                    {/* Photo de l'avis (seulement s'il y en a une) */}
                    {a.photo && <img src={imgUrl(a.photo)} alt={`Voyage de ${a.nom}`} className="w-full h-44 object-cover" />}
                    <div className="p-6 flex flex-col flex-1">
                    <Quote size={22} className="text-[#F26B1D] mb-3" />
                    {/* flex-1 : pousse la signature en bas pour que toutes les cartes soient alignées */}
                    <p className="text-[#333333] leading-relaxed whitespace-pre-line flex-1">{a.message}</p>
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

            {/* ===== FORMULAIRE (visible seulement quand « ouvert » est vrai) ===== */}
            {ouvert && (
            <form onSubmit={envoyer} className="mt-12 mx-auto max-w-3xl bg-white rounded-lg border border-[#E5E5E5] p-8 space-y-5">
                <h3 className={`${titres} text-2xl font-extrabold`}>Racontez votre voyage</h3>

                {/* Nom et ville côte à côte */}
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

                {/* Le texte de l'avis */}
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

                {/* Bouton d'envoi */}
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
