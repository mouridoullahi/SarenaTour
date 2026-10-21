import { EMAIL, PHONE_DISPLAY, imgUrl } from '../lib/config';

export default function SiteFooter() {
  return (
    <footer className="bg-[#141414] text-white py-14">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div>
          <p className="font-[family-name:var(--font-serif)] text-2xl font-bold">
            SarenaTour <em className="text-[#FF9A52]">Sénégal</em>
          </p>
          <p className="text-sm text-white/80 mt-3">
            Guide local indépendant. Visites authentiques, sur mesure et chaleureuses au cœur du pays de la Teranga.
          </p>
        </div>
        <div className="text-sm space-y-1">
          <p className="text-xs tracking-[0.25em] text-[#FF9A52] mb-2">CONTACT</p>
          <p>{PHONE_DISPLAY}</p>
          <p>{EMAIL}</p>
          <p>Mbour, Sénégal</p>
        </div>
        <img
          src={imgUrl('Logo Sarena Touristique.png')}
          alt="SarenaTour"
          className="w-24 h-24 object-contain rounded-2xl bg-[#FFFFFF] p-2 md:mx-auto"
        />
      </div>
      <p className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-white/20 text-center text-xs text-white/70">
        © 2026 SarenaTour — Tous droits réservés
      </p>
    </footer>
  );
}
