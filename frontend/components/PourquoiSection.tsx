import Link from 'next/link';

const serif = 'font-[family-name:var(--font-serif)]';

// Les 4 arguments : à réécrire avec VOS mots (expérience, régions, langues parlées…)
const raisons = [
  { titre: 'Un guide du pays', texte: "Je connais chaque région et chaque village. Vous gagnez du temps et vous voyez l'essentiel." },
  { titre: 'Des rencontres vraies', texte: 'Marchés, familles, artisans : des moments partagés, loin des circuits de masse.' },
  { titre: 'Un voyage serein', texte: 'Transport fiable, horaires tenus et un interlocuteur joignable pendant tout le séjour.' },
  { titre: 'Un programme à votre image', texte: 'Safari, désert, îles ou culture : on compose ensemble selon vos envies et votre budget.' },
];

export default function PourquoiSection() {
  return (
    <section id="pourquoi" className="py-24 bg-[#111111] text-white">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-14">

        {/* Colonne gauche : titre aligné à gauche */}
        <div className="lg:sticky lg:top-32 self-start">
          <p className="text-[#F26B1D] font-bold text-sm uppercase tracking-widest mb-4">Pourquoi nous</p>
          <h2 className={`${serif} text-4xl sm:text-5xl font-extrabold leading-[1.05]`}>
            Voyager avec <em className="text-[#F26B1D]">quelqu'un d'ici</em>
          </h2>
          <p className="text-white/70 mt-6 max-w-md">
            Un guide local change tout : accès, confiance, bonnes adresses.
          </p>
          <Link href="/guide" className="inline-block mt-8 border-b-2 border-[#F26B1D] pb-1 font-semibold hover:text-[#F26B1D] transition">
            Faire connaissance avec votre guide →
          </Link>
        </div>

        {/* Colonne droite : liste numérotée (sans cartes) */}
        <ol>
          {raisons.map((r, i) => (
            <li key={r.titre} className="group flex gap-6 py-8 border-t border-white/15 first:border-t-0 lg:first:border-t">
              <span className={`${serif} text-5xl font-extrabold text-white/20 group-hover:text-[#F26B1D] transition-colors`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={`${serif} text-2xl font-bold`}>{r.titre}</h3>
                <p className="text-white/70 mt-2 leading-relaxed">{r.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
