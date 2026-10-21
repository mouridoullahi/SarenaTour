'use client'; // La section réagit aux clics (choix des centres d'intérêt) : elle doit être « client »

import { useState } from 'react';
import { Mail, MapPin, ArrowRight, Check } from 'lucide-react'; // icônes
import WhatsAppIcon from './WhatsAppIcon';

const titres = 'font-[family-name:var(--font-serif)]'; // police des titres

// Ce que le visiteur peut cocher : modifiez cette liste à votre goût
const INTERETS = ['Safari', 'Désert', 'Îles et plages', 'Culture et villages', 'Circuit sur mesure'];

// Les informations viennent de page.tsx (une seule source) : voir <ContactSection ... /> dans la page
interface Props {
  status: 'idle' | 'loading' | 'ok' | 'error'; // état de l'envoi
  waText: string;                              // message WhatsApp préparé après l'envoi
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; // fonction d'envoi (handleSubmit de la page)
  waNumber: string;
  phone: string;
  email: string;
}

export default function ContactSection({ status, waText, onSubmit, waNumber, phone, email }: Props) {
  const [choix, setChoix] = useState<string[]>([]); // centres d'intérêt cochés

  // Coche ou décoche un centre d'intérêt
  const basculer = (t: string) => setChoix((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t]));

  // Avant l'envoi : on ajoute les centres d'intérêt au texte du projet, puis on appelle l'envoi normal
  const envoyer = (e: React.FormEvent<HTMLFormElement>) => {
    const zone = e.currentTarget.elements.namedItem('projet') as HTMLTextAreaElement | null;
    const ligne = `Intéressé par : ${choix.join(', ')}`;
    if (zone && choix.length > 0 && !zone.value.includes(ligne)) zone.value = `${zone.value}\n\n${ligne}`;
    onSubmit(e);
  };

  // Les 3 cartes de contact
  const cartes = [
    { icone: <WhatsAppIcon size={22} />, titre: 'WhatsApp', valeur: phone, lien: `https://wa.me/${waNumber}` },
    { icone: <Mail size={22} />, titre: 'Email', valeur: email, lien: `mailto:${email}` },
    { icone: <MapPin size={22} />, titre: 'Où nous trouver', valeur: 'Mbour, Sénégal', lien: '' },
  ];

  const champ = 'w-full px-4 py-3 rounded-md border border-[#D9D9D9] bg-white focus:outline-none focus:border-[#F26B1D] focus:ring-2 focus:ring-[#F26B1D]/20 text-base transition';

  return (
    // Fond noir ; « relative overflow-hidden » garde les lueurs à l'intérieur de la section
    <section id="contact" className="relative overflow-hidden bg-[#111111] text-white py-24">
      {/* Deux lueurs orange floues qui pulsent doucement (décoration) */}
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-[#F26B1D]/25 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-[#F26B1D]/15 blur-3xl animate-pulse" />

      <div className="relative max-w-[1200px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">

        {/* ===== COLONNE GAUCHE : titre + cartes de contact ===== */}
        <div>
          <p className="text-[#FF9A52] font-bold text-sm uppercase tracking-widest mb-4">Contact</p>
          <h2 className={`${titres} text-5xl sm:text-6xl font-extrabold leading-[1.02]`}>
            Parlons de votre <span className="text-[#F26B1D]">voyage</span>
          </h2>
          <p className="text-white/70 text-lg mt-6 max-w-md">
            Basé à Pointe Sarène, je réponds le plus vite sur WhatsApp. Dites-moi vos envies, on construit le reste ensemble.
          </p>

          <div className="mt-10 space-y-4">
            {cartes.map((c) => {
              // Si la carte a un lien, c'est un <a> cliquable ; sinon un simple <div>
              const Balise = c.lien ? 'a' : 'div';
              return (
                <Balise
                  key={c.titre}
                  {...(c.lien ? { href: c.lien } : {})}
                  // group : l'icône et la flèche réagissent au survol de la carte entière
                  className="group flex items-center gap-4 p-4 rounded-lg border border-white/15 bg-white/5 hover:border-[#F26B1D] hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="w-12 h-12 grid place-items-center rounded-md bg-[#F26B1D]/15 text-[#FF9A52] group-hover:bg-[#F26B1D] group-hover:text-white transition-colors">
                    {c.icone}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs uppercase tracking-widest text-white/50">{c.titre}</span>
                    <span className="block font-bold truncate">{c.valeur}</span>
                  </span>
                  {c.lien && <ArrowRight size={20} className="text-white/30 group-hover:text-[#F26B1D] group-hover:translate-x-1 transition-all" />}
                </Balise>
              );
            })}
          </div>
        </div>

        {/* ===== COLONNE DROITE : formulaire (carte blanche avec liseré orange) ===== */}
        <form onSubmit={envoyer} className="bg-white text-[#111111] rounded-lg border-t-4 border-[#F26B1D] shadow-[0_30px_80px_rgba(0,0,0,0.5)] p-7 sm:p-9 space-y-6">
          <div>
            <h3 className={`${titres} text-2xl font-extrabold`}>Dites-moi tout</h3>
            <p className="text-sm text-[#666666] mt-1">Quelques lignes suffisent, je vous réponds avec une proposition.</p>
          </div>

          {/* Centres d'intérêt : boutons qu'on active / désactive d'un clic */}
          <div>
            <p className="text-sm font-semibold mb-3">Qu'est-ce qui vous attire ?</p>
            <div className="flex flex-wrap gap-2">
              {INTERETS.map((t) => {
                const actif = choix.includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => basculer(t)}
                    aria-pressed={actif}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold border transition-all ${
                      actif ? 'bg-[#F26B1D] border-[#F26B1D] text-white scale-105' : 'border-[#D9D9D9] text-[#333333] hover:border-[#F26B1D] hover:text-[#F26B1D]'
                    }`}
                  >
                    {actif && <Check size={14} />} {t}
                  </button>
                );
              })}
            </div>
          </div>

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
            <textarea name="projet" rows={4} required className={champ}
              placeholder="Dates, nombre de personnes, ce dont vous rêvez…" />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group w-full inline-flex items-center justify-center gap-2 bg-[#F26B1D] hover:bg-[#D95A10] disabled:opacity-60 text-white font-bold px-8 py-4 rounded-md transition"
          >
            {status === 'loading' ? 'Envoi…' : 'Envoyer ma demande'}
            {status !== 'loading' && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          {/* Messages après l'envoi */}
          {status === 'ok' && (
            <div className="flex gap-3 rounded-md bg-[#FFF4EC] border border-[#FFD9BF] p-4 text-sm">
              <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-[#F26B1D] text-white"><Check size={14} /></span>
              <div>
                <p className="font-semibold">Merci ! Votre demande est bien enregistrée.</p>
                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
                   className="underline text-[#D95A10]">Continuer sur WhatsApp →</a>
              </div>
            </div>
          )}
          {status === 'error' && <p className="text-red-600 text-sm">Une erreur est survenue. Réessayez ou écrivez-moi sur WhatsApp.</p>}
        </form>
      </div>
    </section>
  );
}