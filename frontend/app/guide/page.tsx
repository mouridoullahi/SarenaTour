import type { Metadata } from 'next';
  import { imgUrl, waLink } from '../../lib/config';
  import SiteHeader from '../../components/SiteHeader';
  import SiteFooter from '../../components/SiteFooter';
  //import WhatsAppIcon from '../components/WhatsAppIcon';

export const metadata: Metadata = {
  title: 'SarenaTour – Guide local au Sénégal pour des excursions authentiques',
  description:
    "Rencontrez votre guide local au Sénégal : plus de 20 ans d'expérience, excursions authentiques et sur mesure.",
};

const serif = 'font-[family-name:var(--font-serif)]';

/* Texte à adapter à votre histoire (lieu de naissance, famille, etc.) */
const PARAGRAPHS: React.ReactNode[] = [
  
  <>Bienvenue ! Je suis votre <strong>guide local passionné au Sénégal</strong>. Natif du pays, je mets mes 6 années d'expérience au service de votre voyage pour vous révéler les secrets les mieux gardés de notre belle région.</>,
  <>Mon engagement avec <strong>SarenaTour</strong> : vous offrir des <strong>excursions sur-mesure et immersives au Sénégal</strong>. Oubliez les circuits stéréotypés et plongez au cœur de la vraie culture sénégalaise.</>,
  <>Reconnu pour mon accueil chaleureux et mon sens du détail, je reste à votre entière disposition à chaque étape de votre séjour pour répondre à vos envies les plus spécifiques.</>,
  <>En tant que <strong>guide professionnel au Sénégal</strong>, je vous emmène explorer nos plus beaux trésors : de la mémoire de l'île de Gorée à la faune sauvage de Bandia, en passant par la magie du désert de Lompoul et la sérénité du Saloum.</>,
  <>À travers mon ancrage local, accédez à des moments privilégiés : initiations aux arts locaux, balades guidées dans les villages et partages authentiques avec les communautés.</>,
  <>Laissez-vous tenter par les saveurs de la cuisine locale lors de nos étapes gourmandes : du fameux Thiéboudienne aux rafraîchissants jus de Bouye et Bissap préparés avec soin.</>,
  <>Chaque <strong>circuit touristique au Sénégal</strong> est pensé pour vous offrir un parfait équilibre entre découverte, sécurité, confort et émerveillement à votre propre rythme.</>,
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="max-w-[1200px] mx-auto px-6 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
          {/* Photo */}
          <div className="lg:sticky lg:top-32">
            <img
              src={imgUrl('Sarena.jpeg')}
              alt="transition-all duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.28)]"
              className="w-full max-h-[640px] object-cover rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            />
          </div>

          {/* Texte */}
          <div>
            <span className="text-[#F26B1D] font-semibold text-xs uppercase tracking-[0.25em] block mb-4">
              GUIDE LOCAL AU SÉNÉGAL
            </span>
            <h1 className={`${serif} text-4xl sm:text-5xl font-bold leading-tight mb-8`}>
              SarenaTour – Guide local au Sénégal pour des excursions authentiques
            </h1>
            <div className="space-y-5 text-[#444444] text-lg leading-relaxed">
              {PARAGRAPHS.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </section>

        {/* Bandeau réservation */}
        <section className="bg-[#1C1C1C] text-white text-center px-6 py-20">
          <h2 className={`${serif} text-3xl sm:text-4xl font-bold mb-4`}>
            Réserver une excursion avec un guide local au Sénégal
          </h2>
          <p className="text-white/80 mb-8">Contactez-moi pour organiser votre voyage sur mesure au Sénégal.</p>
          <a
            href={waLink("Bonjour, je souhaite organiser une excursion au Sénégal.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#6B8E23] hover:bg-[#5A7A1C] text-white font-semibold px-8 py-3 rounded-full text-sm transition shadow-lg"
          >
            Me contacter pour une excursion au Sénégal
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
