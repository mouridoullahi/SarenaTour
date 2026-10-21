'use client'; // Cette barre réagit au défilement et aux clics : elle doit être « client »

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';          // icônes « trois traits » et « croix »
import WhatsAppIcon from './WhatsAppIcon';      // logo WhatsApp
import { imgUrl, WA_NUMBER } from '../lib/config'; // adresse des images + numéro WhatsApp

// Les boutons du menu : [texte affiché, identifiant de la section visée]
const MENU = [
  ['À propos', 'apropos'],
  ['Destinations', 'destinations'],
  ['Pourquoi nous', 'pourquoi'],
  ['Avis', 'temoignages'],
  ['Contact', 'contact'],
];

export default function Navbar() {
  const [actif, setActif] = useState('');      // section actuellement visible à l'écran
  const [ouvert, setOuvert] = useState(false); // menu téléphone ouvert ou fermé

  // Repère la section visible pour allumer le bon bouton (« scrollspy »)
  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => entrees.forEach((e) => e.isIntersecting && setActif(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' } // une section est « active » quand elle passe vers le milieu de l'écran
    );
    MENU.forEach(([, id]) => {
      const el = document.getElementById(id);
      if (el) observateur.observe(el);
    });
    return () => observateur.disconnect(); // nettoyage
  }, []);

  return (
    // sticky top-0 : la barre reste en haut quand on défile ; le padding crée l'effet « flottant »
    <header className="sticky top-0 z-50 px-3 sm:px-6 pt-3">
      {/* La barre : fond noir, coins arrondis, filet orange en bas */}
      <div className="relative max-w-[1200px] mx-auto bg-[#111111]/95 backdrop-blur-md rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] border-b-2 border-[#F26B1D] px-4 h-16 flex items-center justify-between gap-4">

        {/* ----- Logo + nom (clic = retour à l'accueil) ----- */}
        <a href="/" className="flex items-center gap-3 shrink-0">
          <img src={imgUrl('Logo Sarena Touristique.png')} alt="Logo SarenaTour" className="w-10 h-10 object-contain rounded-md bg-white" />
          <span className="hidden sm:block font-[family-name:var(--font-serif)] text-xl font-extrabold tracking-tight text-white">
            Sarena<span className="text-[#F26B1D]">Tour</span>
          </span>
        </a>

        {/* ----- Les boutons du menu (ordinateur seulement : hidden md:flex) ----- */}
        <nav className="hidden md:flex items-center gap-1">
          {MENU.map(([texte, id]) => (
            <a
              key={id}
              href={`/#${id}`}
              // Bouton actif : fond orange. Autres : texte clair, qui s'éclaire au survol.
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                actif === id
                  ? 'bg-[#F26B1D] text-white shadow-[0_4px_14px_rgba(242,107,29,0.45)]'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              {texte}
            </a>
          ))}
        </nav>

        {/* ----- Bouton WhatsApp + trois traits (téléphone) ----- */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-[#06240F] font-bold px-4 py-2 rounded-md text-sm transition"
          >
            <WhatsAppIcon size={18} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setOuvert(!ouvert)}
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="md:hidden w-10 h-10 grid place-items-center rounded-md text-white hover:bg-white/10"
          >
            {ouvert ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ----- Liste déroulante du téléphone ----- */}
        {ouvert && (
          <nav className="md:hidden absolute top-full inset-x-0 mt-2 bg-[#111111] rounded-xl shadow-2xl border border-white/10 p-2">
            {MENU.map(([texte, id]) => (
              <a
                key={id}
                href={`/#${id}`}
                onClick={() => setOuvert(false)} // referme le menu après un clic
                className={`block px-4 py-3 rounded-md font-semibold ${actif === id ? 'bg-[#F26B1D] text-white' : 'text-white/80 hover:bg-white/10'}`}
              >
                {texte}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
